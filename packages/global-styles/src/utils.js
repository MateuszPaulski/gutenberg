export function isEditSite() {
	return window.location.search.indexOf( 'page=gutenberg-edit-site' ) >= 0;
}

export function toPx( value ) {
	return `${ value }px`;
}

export function fromPx( value ) {
	return +value.replace( 'px', '' );
}
