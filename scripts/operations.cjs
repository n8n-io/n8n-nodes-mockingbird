// Operation names for the generated nodes, keyed by "METHOD /path" (spec path without /v1).
// [Name (Title Case, n8n vocabulary), action (Sentence case)].
// An operation that is not listed here is skipped. Binary endpoints are left out on purpose.
module.exports = {
	// Product Catalogue
	'GET /products': ['Get Many', 'Get many products'],
	'GET /products/categories': ['Get Categories', 'Get product categories'],
	'GET /products/{product_id}': ['Get', 'Get a product'],

	// Orders (invoice PDF and zip are binary)
	'GET /orders': ['Get Many', 'Get many orders'],
	'GET /orders/cursor': ['Get Many (Cursor)', 'Get many orders using cursor pagination'],
	'GET /orders/{order_id}': ['Get', 'Get an order'],

	// Helpdesk
	'GET /tickets': ['Get Many', 'Get many tickets'],
	'POST /tickets': ['Create', 'Create a ticket'],
	'GET /tickets/{ticket_id}': ['Get', 'Get a ticket'],
	'PATCH /tickets/{ticket_id}': ['Update', 'Update a ticket'],
	'PUT /tickets/{ticket_id}': ['Replace', 'Replace a ticket'],
	'POST /tickets/{ticket_id}/comments': ['Add Comment', 'Add a comment to a ticket'],

	// Weather
	'GET /weather/{city}': ['Get Current', 'Get the current weather for a city'],
	'GET /weather/{city}/forecast': ['Get Forecast', 'Get a forecast for a city'],

	// Exchange Rates
	'GET /rates': ['Get Rates', 'Get exchange rates for a base currency'],
	'GET /rates/convert': ['Convert', 'Convert an amount between currencies'],

	// Quotes
	'GET /quotes': ['Get Many', 'Get many quotes'],
	'GET /quotes/random': ['Get Quote of the Day', 'Get the quote of the day'],
	'GET /quotes/{quote_id}': ['Get', 'Get a quote'],

	// Utilities
	'GET /util/countries': ['Get Countries', 'Get a list of countries'],
	'GET /util/echo': ['Echo', 'Echo the request'],
	'GET /util/status/{code}': ['Respond With Status', 'Respond with a given HTTP status'],
	'GET /util/delay/{seconds}': ['Respond After Delay', 'Respond after a delay'],
	'GET /util/uuid': ['Generate UUID', 'Generate a UUID'],
	'POST /util/hash': ['Hash Text', 'Hash text'],
	'POST /util/base64/encode': ['Encode Base64', 'Base64 encode text'],
	'POST /util/base64/decode': ['Decode Base64', 'Base64 decode text'],
	'POST /util/validate/email': ['Validate Email', 'Validate an email address'],
	'POST /util/validate/iban': ['Validate IBAN', 'Validate an IBAN'],
	'POST /util/validate/vat': ['Validate VAT Number', 'Validate an EU VAT number'],
	'GET /util/convert': ['Convert Units', 'Convert between units'],
	'POST /util/lorem': ['Generate Lorem Ipsum', 'Generate placeholder text'],

	// CRM Lite
	'GET /customers': ['Get Many', 'Get many customers'],
	'POST /customers': ['Create', 'Create a customer'],
	'GET /customers/{customer_id}': ['Get', 'Get a customer'],

	// Fun Pack (the two image endpoints return SVG and are left out)
	'GET /fun/dogs/random': ['Get Random Dog', 'Get a random dog image'],
	'GET /fun/dogs/breeds': ['Get Dog Breeds', 'Get a list of dog breeds'],
	'GET /fun/dogs/breed/{breed}/random': ['Get Random Dog by Breed', 'Get a random dog of a breed'],
	'GET /fun/cats/random': ['Get Random Cat', 'Get a random cat image'],
	'GET /fun/robots/random': ['Get Random Robot', 'Get a random robot image'],
	'GET /fun/jokes/random': ['Get Random Joke', 'Get a random joke'],
	'GET /fun/jokes/{joke_id}': ['Get Joke', 'Get a joke'],
	'GET /fun/facts/random': ['Get Random Fact', 'Get a random fact'],
	'GET /fun/activities/random': ['Get Random Activity', 'Get a random activity'],
	'GET /fun/trivia': ['Get Trivia', 'Get trivia questions'],
	'GET /fun/users/random': ['Get Random Users', 'Get random fake users'],
	'GET /fun/numbers/{n}': ['Get Number Fact', 'Get a fact about a number'],
	'GET /fun/fortune': ['Get Fortune', 'Get a fortune cookie message'],
};
