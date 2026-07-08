/**
 * Set of fixed user to be used in the project with different rols like user, staff and admin.
 *
 * Staff Role => Can approve a received request to the dealership as reached. Can't delete or add car.
 * Admin Role => Can approve a received request to the dealership as reached, add or delete car.
 * User role => not used as there is non logged-in user session where the customer can submit a request to the
 * dealership.
 */
const users = [
    { id: '1', name: 'Alice',   username: 'alice',
        password: 'alice',    role: 'user' },
    { id: '2', name: 'Bob',     username: 'bob',
        password: 'bob',    role: 'staff' },
    { id: '3', name: 'Charlie', username: 'charlie',
        password: 'charlie',    role: 'admin' },
]

/**
 * Validates user with its password.
 * @param name username in the users array
 * @param password password for that user name.
 * @returns User if its valid username and has a valid password.
 */
export async function  validateUser(name, password) {
    return users.find(user =>
        user.username == name && user.password == password);
}
