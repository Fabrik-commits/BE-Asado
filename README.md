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
| events | createEvent | Creates an event | POST |  | Yes | title: String, description: String, datetime: Date, memberLimit: Number (Integer), members: [ObjectId of members], organizer: ObjectId of a member, (chef: ObjectId of a member), (shoppingDesignee: ObjectId of a member) |
| events | editEvent/:id | Edits an event by its id (12 byte Object ID) | PUT | id | Yes and user token needs to be the organizer's | title: String, description: String, datetime: Date, memberLimit: Number (Integer), state: String with limited values {full, closed, available, cancelled, finished}, members: [ObjectId of members], chef: ObjectId of a member, shoppingDesignee: ObjectId of a member, transferReceipts: [ObjectId of members], purchaseReceipts: [ObjectId of members] |
| events | deleteEvent/:id | Deletes an event by its id (12 byte Object ID) | DELETE | id | Yes and user token needs to be the organizer's |  |
| - | login | Logs a user and returns the auth token | POST |  | No | email: String, password: String |
| purchaseReceipts | getPurchaseReceiptsByEvent/:event | Gets all purchaseReceipts from an event providing the event's id (12 byte Object ID) | GET | event | Yes |  |
| purchaseReceipts | getPurchaseReceiptById/:event | Gets a single purchaseReceipts by its id (12 byte Object ID) | GET | id | Yes |  |
| purchaseReceipts | createPurchaseReceipt/:event | Creates a purchaseReceipt for a certain event | POST | event | Yes and user token needs to be the shoppingDesignee's | description: String, amount: Number, (image: String) |
| purchaseReceipts | deletePurchaseReceipt/:id/:event | Deletes a purchaseReceipt by id for a certain event providing the event's id (12 byte Object ID) | DELETE | id, event | Yes and user token needs to be the shoppingDesignee's |  |
| password | forgot | Updates verification code for password recovery and sends the recovery email | POST |  | No | email: String |
| password | recover | Changes user's password providing the correct verification code | PUT |  | No | email: String, verificationCode: String, password: String |
| transferReceipts | getTransferReceiptsByEvent/:event | Gets all transferReceipts from an event providing the event's id (12 byte Object ID) | GET | event | Yes and user token needs to be the shoppingDesignee's |  |
| transferReceipts | getTransferReceiptsById/:id | Gets a single transferReceipts by its id (12 byte Object ID) | GET | id | Yes |  |
| transferReceipts | createTransferPurchase/:event | Creates a transferReceipt for a certain event | POST | event | Yes | description: String, amount: Number, user: ObjectId of a member, (paymentMethod: String), (image: String) | DON'T SEND hasPaid: Boolean or send it as false |
| transferReceipts | deleteTransferPurchase/:event | Deletes a transferReceipt by its id (12 byte Object ID) | DELETE | id | Yes (and user token needs to be the receipt owner -> not functional yet) |  |
| users | getUsers  | Gets all users in the database | GET |  | Yes |  |
| users | getUserById/:id | Gets a user by its id (12 byte Object ID) | GET | id | Yes |  |
| users | register | Creates a user | POST |  | No| name: String, email: String, password: String, profilePicture: String, [specialDiet: String with limited values {celiac, hypertensive, vegan, vegetarian}], (cbu: String), (alias: String) |
| users | editUser/:id | Edits a user by its id (12 byte Object ID) - NEED TO FIX AUTH -  | PUT | id | Yes (and user token needs to be the user to edit-> not functional yet) |  |
| users | deleteUser/:id | Deletes a user by id (12 byte Object ID) - NEED TO FIX AUTH - | DELETE | id | Yes (and user token needs to be the user to delete -> not functional yet) | name: String, profilePicture: String, [specialDiet: String with limited values {celiac, hypertensive, vegan, vegetarian}], cbu: String, alias: String |

