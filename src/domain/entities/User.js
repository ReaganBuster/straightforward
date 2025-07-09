const { v4: uuidv4 } = require('uuid');

class User {
    constructor({
        user_id = uuidv4(),
        username,
        name,
        email,
        password, // Password hash (should be hashed, not plain text)
        gender = null,
        sexual_orientation = null,
        avatar_url = null,
        bio = null,
        born = null,
        location = null, // General location/city
        address = null, // Optional: more specific address
        contact = null, // Phone or other contact info
        interests = [], // Array of interests/hobbies
        created_at = new Date(),
        updated_at = new Date(),
        last_seen = new Date(),
        is_verified = false,
        is_online = false,
        rating = null,
        balance = 0.00,
        currency = 'UGX',
        profile_views = 0,
        connections = [], // Array of user_ids or objects
        tokens = null, // For authentication/session
        blocked_users = [], // Array of blocked user_ids
        reported_users = [], // Array of reported user_ids
        preferences = {}, // Search/match preferences
        status = 'active', // active, suspended, deleted, etc.
    }) {
        this.user_id = user_id;
        this.username = username;
        this.name = name;
        this.email = email;
        this.password = password;
        this.gender = gender;
        this.sexual_orientation = sexual_orientation;
        this.avatar_url = avatar_url;
        this.bio = bio;
        this.born = born;
        this.location = location;
        this.address = address;
        this.contact = contact;
        this.interests = interests;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.last_seen = last_seen;
        this.is_verified = is_verified;
        this.is_online = is_online;
        this.rating = rating;
        this.balance = balance;
        this.currency = currency;
        this.profile_views = profile_views;
        this.connections = connections;
        this.tokens = tokens;
        this.blocked_users = blocked_users;
        this.reported_users = reported_users;
        this.preferences = preferences;
        this.status = status;
    }
}

export default User;