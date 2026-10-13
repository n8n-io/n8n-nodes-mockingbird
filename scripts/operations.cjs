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

	// People / HR (employee photo is binary)
	'GET /employees': ['Get Many', 'Get many employees'],
	'POST /employees': ['Create', 'Create an employee'],
	'GET /employees/{employee_id}': ['Get', 'Get an employee'],
	'PATCH /employees/{employee_id}': ['Update', 'Update an employee'],
	'GET /employees/{employee_id}/reports': ['Get Reports', 'Get the direct reports of an employee'],
	'GET /departments': ['Get Departments', 'Get departments'],
	'GET /orgchart': ['Get Org Chart', 'Get the org chart'],
	'GET /salary-bands': ['Get Salary Bands', 'Get salary bands'],

	// Time Off
	'GET /employees/{employee_id}/time-off/balance': [
		'Get Balance',
		'Get the time off balance of an employee',
	],
	'GET /time-off/requests': ['Get Many', 'Get many time off requests'],
	'POST /time-off/requests': ['Create', 'Create a time off request'],
	'GET /employees/{employee_id}/time-off/requests': [
		'Get Many by Employee',
		'Get the time off requests of an employee',
	],
	'PATCH /time-off/requests/{request_id}': ['Update', 'Update a time off request'],
	'GET /time-off/calendar': ['Get Calendar', 'Get the time off calendar'],

	// Inventory
	'GET /inventory/{product_id}': ['Get', 'Get the stock level of a product'],
	'POST /reservations': ['Create Reservation', 'Reserve stock'],
	'DELETE /reservations/{reservation_id}': ['Delete Reservation', 'Delete a stock reservation'],

	// Batch Jobs
	'POST /jobs': ['Create', 'Create a job'],
	'GET /jobs/{job_id}': ['Get', 'Get a job'],
	'GET /jobs/{job_id}/result': ['Get Result', 'Get the result of a job'],

	// Event Stream
	'GET /events': ['Get Many', 'Get many events'],

	// Fraud Detection
	'GET /transactions': ['Get Many', 'Get many transactions'],
	'GET /transactions/{transaction_id}': ['Get', 'Get a transaction'],
	'POST /fraud/score': ['Score', 'Score a transaction for fraud'],
	'POST /fraud/cases': ['Create Case', 'Create a fraud case'],
	'PATCH /fraud/cases/{case_id}': ['Update Case', 'Update a fraud case'],

	// Security Monitor
	'GET /security/events': ['Get Many Events', 'Get many security events'],
	'GET /security/blocks': ['Get Many Blocks', 'Get many blocks'],
	'POST /security/blocks': ['Create Block', 'Create a block'],

	// Product Reviews
	'GET /reviews': ['Get Many', 'Get many reviews'],
	'POST /reviews': ['Create', 'Create a review'],
	'GET /reviews/latest': ['Get Latest', 'Get the latest reviews'],
	'PATCH /reviews/{review_id}/moderate': ['Moderate', 'Moderate a review'],

	// Webhook Hub
	'GET /webhooks/subscriptions': ['Get Many Subscriptions', 'Get many webhook subscriptions'],
	'POST /webhooks/subscriptions': ['Create Subscription', 'Create a webhook subscription'],
	'DELETE /webhooks/subscriptions/{subscription_id}': [
		'Delete Subscription',
		'Delete a webhook subscription',
	],
	'POST /webhooks/fire': ['Fire', 'Fire a webhook event'],

	// Document Store (file upload and download are binary)
	'GET /files': ['Get Many', 'Get many files'],

	// Sandbox
	'POST /sandbox/reset': ['Reset', 'Reset the sandbox'],
	'GET /sandbox-id': ['Get ID', 'Get a new sandbox ID'],

	// Meeting Rooms
	'GET /rooms': ['Get Many Rooms', 'Get many rooms'],
	'GET /rooms/availability': ['Get Availability', 'Get room availability'],
	'POST /bookings': ['Create Booking', 'Book a room'],
	'DELETE /bookings/{booking_id}': ['Delete Booking', 'Delete a booking'],

	// Knowledge Base
	'GET /kb/search': ['Search', 'Search articles'],
	'GET /kb/articles/{article_id}': ['Get', 'Get an article'],

	// Agent Tools
	'GET /agent/customers/lookup': ['Look Up Customer', 'Look up a customer'],
	'POST /agent/orders/{order_id}/refund': ['Refund Order', 'Refund an order'],
	'POST /agent/orders/{order_id}/cancel': ['Cancel Order', 'Cancel an order'],
	'POST /agent/orders/{order_id}/resend-invoice': [
		'Resend Invoice',
		'Resend the invoice of an order',
	],
	'GET /agent/tickets/next': ['Get Next Ticket', 'Get the next ticket to work on'],
	'POST /agent/tickets/{ticket_id}/resolve': ['Resolve Ticket', 'Resolve a ticket'],
	'GET /agent/tools': ['Get Tools', 'Get the available agent tools'],

	// Classifier
	'POST /classify/sentiment': ['Classify Sentiment', 'Classify the sentiment of text'],
	'POST /classify/intent': ['Classify Intent', 'Classify the intent of text'],
	'POST /extract/entities': ['Extract Entities', 'Extract entities from text'],

	// Assessments (source zip is binary)
	'GET /assessments': ['Get Many', 'Get many assessments'],
	'GET /assessments/{slug}': ['Get', 'Get an assessment'],
	'GET /assessments/{slug}/source': ['Get Source', 'Get the source files of an assessment'],
	'POST /assessments/{slug}/submit': ['Submit', 'Submit an assessment'],
};
