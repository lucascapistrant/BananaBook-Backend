function buildPostsPipeline(filter, sortField, sortOrder, cursor, limit) {
    return [
        // Match the initial filter
        { $match: filter },
        // Lookup user details
        {
            $lookup: {
              from: "Users",
              let: { userId: { $toObjectId: "$userId" } }, // Convert userId to ObjectId
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$userId"] } } }
              ],
              as: "userDetails"
            }
        },
        {
            $unwind: {
              path: "$userDetails",
              preserveNullAndEmptyArrays: true
            }
        },

        // Project fields to include only what you need
        {
            $project: {
                title: 1,
                content: 1,
                images: 1,
                createdAt: 1,
                likes: { $ifNull: ["$likes", []] },
                likesCount: { $size: { $ifNull: ["$likes", []] } },
                userId: 1,
                "userDetails.username": 1,
                "userDetails.profilePicture": 1
            }
        },
        cursor !== null
        ? { $match: { [sortField]: { [sortOrder === -1 ? "$lt" : "$gt"]: cursor } } }
        : null,

        // Sort the results
        { $sort: { [sortField]: sortOrder } },

        // Limit the results
        { $limit: limit }
    ].filter(Boolean); // Remove null stages if no cursor is provided
}


export default buildPostsPipeline;