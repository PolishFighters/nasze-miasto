module.exports = {
    db: {
        users: [
            {
                id: 0,
                firstname: "Jan",
                lastname: "Kowalski",
                email: "jkowalski@example.com",
                password: "ff174f1711656f0f640a0e66442dc58c6efb00d5",
                liked: [0, 1, 2]
            }
        ],
        posts: [
            {
                id: 0,
                content: "",
                likes: 3243, //cache
                deleted: false
            }
        ]
    }
}