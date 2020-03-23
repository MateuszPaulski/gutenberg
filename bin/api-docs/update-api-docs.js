/**
 * External dependencies
 */
const { join, relative, resolve, sep, basename, dirname } = require( 'path' );
const glob = require( 'fast-glob' );
const execa = require( 'execa' );
const { Transform } = require( 'stream' );
const { readFile } = require( 'fs' ).promises;

/**
 * README file tokens, defined as a tuple of token identifier, source path.
 *
 * @typedef {[string,string]} WPReadmeFileTokens
 */

/**
 * README file data, defined as a tuple of README file path, token details.
 *
 * @typedef {[string,WPReadmeFileTokens]} WPReadmeFileData
 */

/**
 * Path to root project directory.
 *
 * @type {string}
 */
const ROOT_DIR = resolve( __dirname, '../..' );

/**
 * Path to packages directory.
 *
 * @type {string}
 */
const PACKAGES_DIR = resolve( ROOT_DIR, 'packages' );

/**
 * Path to data documentation directory.
 *
 * @type {string}
 */
const DATA_DOCS_DIR = resolve(
	ROOT_DIR,
	'docs/designers-developers/developers/data'
);

/**
 * Default path to use if the token doesn't include one.
 */
const DEFAULT_PATH = 'src/index.js';

/**
 * Pattern matching start token of a README file.
 *
 * @type {RegExp}
 */
const TOKEN_PATTERN = /<!-- START TOKEN\((.+?(?:\|(.+?))?)\) -->/g;

/**
 * Given an absolute file path, returns the package name.
 *
 * @param {string} file Absolute path.
 *
 * @return {string} Package name.
 */
function getFilePackage( file ) {
	return file.startsWith( PACKAGES_DIR )
		? relative( PACKAGES_DIR, file ).split( sep )[ 0 ]
		: getDataDocumentationFilePackage( basename( file, '.md' ) );
}

/**
 * Returns an appropriate glob pattern for the packages directory to match
 * relevant documentation files for a given set of files.
 *
 * @param {string[]} files Set of files to match. Pass an empty set to match
 *                         all packages.
 *
 * @return {string} Packages glob pattern.
 */
function getPackagePattern( files ) {
	if ( ! files.length ) {
		return '*';
	}

	// Since brace expansion doesn't work with a single package, special-case
	// the pattern for the singular match.
	const packages = Array.from( new Set( files.map( getFilePackage ) ) );
	return packages.length === 1 ? packages[ 0 ] : '{' + packages.join() + '}';
}

/**
 * Returns the conventional store name of a given package.
 *
 * @param {string} packageName Package name.
 *
 * @return {string} Store name.
 */
function getPackageStoreName( packageName ) {
	let storeName = 'core';
	if ( packageName !== 'core-data' ) {
		storeName += '/' + packageName;
	}

	return storeName;
}

/**
 * Returns the conventional package name of a given documentation file name.
 *
 * @param {string} file Documentation file name.
 *
 * @return {string} package name.
 */
function getDataDocumentationFilePackage( file ) {
	let packageName = file.replace( /^data-/, '' ).replace( /^core-/, '' );
	if ( packageName === 'core' ) {
		packageName += '-data';
	}

	return packageName;
}

/**
 * Returns the conventional documentation file name of a given package.
 *
 * @param {string} packageName Package name.
 *
 * @return {string} Documentation file name.
 */
function getDataDocumentationFile( packageName ) {
	const storeName = getPackageStoreName( packageName );
	return `data-${ storeName.replace( '/', '-' ) }.md`;
}

/**
 * Returns an appropriate glob pattern for the data documentation directory to
 * match relevant documentation files for a given set of files.
 *
 * @param {string[]} files Set of files to match. Pass an empty set to match
 *                         all packages.
 *
 * @return {string} Packages glob pattern.
 */
function getDataDocumentationPattern( files ) {
	if ( ! files.length ) {
		return '*';
	}

	// Since brace expansion doesn't work with a single package, special-case
	// the pattern for the singular match.
	const filePackages = Array.from( new Set( files.map( getFilePackage ) ) );
	const docFiles = filePackages.map( getDataDocumentationFile );

	return docFiles.length === 1 ? docFiles[ 0 ] : '{' + docFiles.join() + '}';
}

/**
 * Stream transform which filters out README files to include only those
 * containing matched token pattern, yielding a tuple of the file and its
 * matched tokens.
 *
 * @type {Transform}
 */
const filterTokenTransform = new Transform( {
	objectMode: true,

	async transform( file, _encoding, callback ) {
		let content;
		try {
			content = await readFile( file, 'utf8' );
		} catch {}

		if ( content ) {
			const tokens = [];

			for ( const match of content.matchAll( TOKEN_PATTERN ) ) {
				const [ , token, path = DEFAULT_PATH ] = match;
				tokens.push( [ token, path ] );
			}

			if ( tokens.length ) {
				this.push( [ file, tokens ] );
			}
		}

		callback();
	},
} );

/**
 * Optional process arguments for which to generate documentation.
 *
 * @type {string[]}
 */
const files = process.argv.slice( 2 );

glob.stream( [
	`${ PACKAGES_DIR }/${ getPackagePattern( files ) }/README.md`,
	`${ DATA_DOCS_DIR }/${ getDataDocumentationPattern( files ) }`,
] )
	.pipe( filterTokenTransform )
	.on( 'data', async ( /** @type {WPReadmeFileData} */ data ) => {
		const [ file, tokens ] = data;
		const output = relative( ROOT_DIR, file );

		// Each file can have more than one placeholder content to update, each
		// represented by tokens. The docgen script updates one token at a time,
		// so the tokens must be replaced in sequence to prevent the processes
		// from overriding each other.
		for ( const [ token, path ] of tokens ) {
			await execa(
				join( __dirname, '..', '..', 'node_modules', '.bin', 'docgen' ),
				[
					relative( ROOT_DIR, resolve( dirname( file ), path ) ),
					`--output ${ output }`,
					'--to-token',
					`--use-token "${ token }"`,
					'--ignore "/unstable|experimental/i"',
				],
				{ shell: true }
			);
		}
	} );
