# BE-Asado

REST API for Eat-Asado.


## Endpoints

References: 

 - (body argument) = Optional
 - [body argument] = Array
 - {values} = the argument only admits values inside curly brackets


| Prefix | Endpoint | Description | Type | Parameters | Auth | Body requirements |
|--|--|--|--|--|--|--|
| events | getEvents | Gets all events in the database | GET |  | Yes |  |
| events | getPublicEvents | Gets all events with public data only sorted by date of creation in descendent order | GET |  | No |  |
| events | getEventById/:id | Gets an event by its id (12 byte Object ID) | GET | id | Yes |  |
| events | createEvent | Creates an event | POST |  | Yes | <ul> <li>title: String</li> <li>description: String</li> <li>datetime: Date</li> <li>memberLimit: Number (Integer)</li> <li>members: [ObjectId of members]</li> <li>organizer: ObjectId of a member</li> <li>(chef: ObjectId of a member)</li> <li>(shoppingDesignee: ObjectId of a member)</li></ul> |
| events | editEvent/:id | Edits an event by its id (12 byte Object ID) | PUT | id | Yes and user token needs to be the organizer's | <ul><li>title: String, <li>description: String, <li>datetime: Date</li> <li>memberLimit: Number (Integer)</li> <li>state: String with limited values {full, closed, available, cancelled, finished}</li> <li>members: [ObjectId of members]</li> <li>chef: ObjectId of a member</li> <li>shoppingDesignee: ObjectId of a member</li> <li>transferReceipts: [ObjectId of members]</li> <li>purchaseReceipts: [ObjectId of members]</li></ul> |
| events | deleteEvent/:id | Deletes an event by its id (12 byte Object ID) | DELETE | id | Yes and user token needs to be the organizer's |  |
| - | login | Logs a user and returns the auth token | POST |  | No | <ul><li>email: String</li> <li>password: String</li></ul> |
| purchaseReceipts | getPurchaseReceiptsByEvent/:event | Gets all purchaseReceipts from an event providing the event's id (12 byte Object ID) | GET | event | Yes |  |
| purchaseReceipts | getPurchaseReceiptById/:event | Gets a single purchaseReceipts by its id (12 byte Object ID) | GET | id | Yes |  |
| purchaseReceipts | createPurchaseReceipt/:event | Creates a purchaseReceipt for a certain event | POST | event | Yes and user token needs to be the shoppingDesignee's | <ul><li>description: String</li> <li>amount: Number</li> <li>(image: String)</li></ul> |
| purchaseReceipts | deletePurchaseReceipt/:id/:event | Deletes a purchaseReceipt by id for a certain event providing the event's id (12 byte Object ID) | DELETE | id, event | Yes and user token needs to be the shoppingDesignee's |  |
| password | forgot | Updates verification code for password recovery and sends the recovery email | POST |  | No | <ul><li>email: String</li></ul> |
| password | recover | Changes user's password providing the correct verification code | PUT |  | No | <ul><li>email: String</li> <li>verificationCode: String</li> <li>password: String</li></ul> |
| transferReceipts | getTransferReceiptsByEvent/:event | Gets all transferReceipts from an event providing the event's id (12 byte Object ID) | GET | event | Yes and user token needs to be the shoppingDesignee's |  |
| transferReceipts | getTransferReceiptsById/:id | Gets a single transferReceipts by its id (12 byte Object ID) | GET | id | Yes |  |
| transferReceipts | createTransferPurchase/:event | Creates a transferReceipt for a certain event | POST | event | Yes | <ul><li>description: String</li> <li>amount: Number</li> <li>user: ObjectId of a member</li> <li>(paymentMethod: String)</li> <li>(image: String)</li>  <li>DON'T SEND hasPaid: Boolean or send it as false</li></ul> |
| transferReceipts | deleteTransferPurchase/:event | Deletes a transferReceipt by its id (12 byte Object ID) | DELETE | id | Yes (and user token needs to be the receipt owner -> not functional yet) |  |
| users | getUsers  | Gets all users in the database | GET |  | Yes |  |
| users | getUserById/:id | Gets a user by its id (12 byte Object ID) | GET | id | Yes |  |
| users | register | Creates a user | POST |  | No | <ul><li>name: String</li> <li>email: String</li> <li>password: String</li> <li>profilePicture: String</li> <li>[specialDiet: String with limited values {celiac, hypertensive, vegan, vegetarian}]</li> <li>(cbu: String)</li> <li>(alias: String)</li></ul> |
| users | editUser/:id | Edits a user by its id (12 byte Object ID) - NEED TO FIX AUTH -  | PUT | id | Yes (and user token needs to be the user to edit-> not functional yet) |  |
| users | deleteUser/:id | Deletes a user by id (12 byte Object ID) - NEED TO FIX AUTH - | DELETE | id | Yes (and user token needs to be the user to delete -> not functional yet) | <ul><li>name: String</li> <li>profilePicture: String</li> <li>[specialDiet: String with limited values {celiac, hypertensive, vegan, vegetarian}]</li> <li>cbu: String</li> <li>alias: String</li></ul> |

