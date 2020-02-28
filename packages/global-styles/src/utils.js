export function toPx( value ) {
	return `${ value }px`;
}

export function fromPx( value ) {
	return +value.replace( 'px', '' );
}
