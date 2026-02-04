export class SchemaNotSatisfiedError extends Error {
	constructor(message = 'Schema not satisfied', options?: ErrorOptions) {
		super(message, options)
		this.name = 'SchemaNotSatisfiedError'
	}
}
