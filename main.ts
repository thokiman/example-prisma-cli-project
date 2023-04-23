import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// const prisma = new PrismaClient({ log: ["query"] }) // log property : log out all query 
// access prisma client -> .user represents model that defined schema.prisma automatically generated for us
// prisma.user
// 4  allow you to interact with db


// reminder : when you create new prisma client
// 1. this actually manages different connections for you so if your db support up to like 5 concurrent connections -> prisma client will handle all five of those connections for you 
// 2.  so it is really important that you only use one instance new PrismaClient() and you don't create a bunch of them otherwise you could bog down your db with too many connections

async function main() {
    // ... you will write your Prisma client queries here
    // almost everything in prisma is asynchronous code

    // delete all users
    await prisma.user.deleteMany()

    // create  a brand new user
    const user = await prisma.user.create({
        data: {// specify how we want to create the query
            // contain the data all we want
            // in this case :  insert data to name column with name = "Kyle"
            name: `Kyle${Math.floor(Math.random() * 9999)}`,
            email: `kyle.${Math.floor(Math.random() * 9999)}@liver.com`,
            age: 27,
            // UserPreferences obj are actually models that are not directly models on user -> these are model that the user references
            // but with prisma, we can actualy do all the nested creation all in one create function 
            userPreference: {
                // this function is going to allow us to create a brand new user preference
                create: {
                    emailUpdates: true
                }
            }
        },
        // // if we actually wanna get their email preferences returned from the return we need to pass -> we need to pass another property to our create
        // include: {
        //     // this say `I want our preferences, our user preferences to be included
        //     // so by using `include` function we can include essentially different references inside here
        //     userPreference: true
        // }

        // instead of using `include` we can use `select`
        // select: {
        //     // `select` can do more specific for returning value -> we can return only `name` property that we want
        //     name: true,
        // }

        // instead of using `include` we can use `select`
        // select: {
        //     // `select` can do more specific for returning value -> we can return only `name` property that we want and include the user preference
        //     name: true,
        //     userPreference: true,
        // }

        // instead of using `include` we can use `select`
        select: {
            // `select` can do more specific for returning value -> we can return only `name` property that we want
            name: true,
            // more specific what return value from nested reference user preference obj
            userPreference: {
                select: {
                    id: true
                }
            },
        }

        // it is important to know you can only either select or include -> you can't do both same time -> only one or the other
    })
    console.log('main -> create : ', user)


    const bulkUsers = await prisma.user.createMany({
        data: [{
            name: `Kyle`,
            email: `kyle.test@liver.com`,
            age: 10,
        },
        {
            name: `Kyle`,
            email: `kyleme.test@liver.com`,
            age: 11,
        },
        {
            name: `Kyle`,
            email: `kyleme1.test@liver.com`,
            age: 12,
        },
        {
            name: `Kyle${Math.floor(Math.random() * 9999)}`,
            email: `kyle.${Math.floor(Math.random() * 9999)}@liver.com`,
            age: Math.floor(Math.random() * 99),
        }
        ],
        // inside createMany you can't use select clause        
    })
    console.log('main -> create many : ', bulkUsers)


    // find all user 
    const users = await prisma.user.findMany()
    console.log('main -> findMany : ', users)

    // find unique user -> it allows you to find things based on unique keys inside your db
    let uniqueUser = await prisma.user.findUnique(
        // inside find* method we always have the ability to do `where` clause
        {
            where: {
                email: "kyle.test@liver.com",

            }
            // also we can pass in `select` or `include` keyword if we want 
        }
    )
    console.log('main -> findUnique : ', uniqueUser)

    // find unique user -> it allows you to find things based on unique keys inside your db
    uniqueUser = await prisma.user.findUnique(
        // inside find* method we always have the ability to do `where` clause
        {
            where: {
                // we can't search thing like just `name` field
                // name: , -> because `name` field doesn't have uniqueness constaint on it from @@unique
                age_name: {
                    // age_name -> whenever we define @@unique([age, name])  block attribute unique key on the age and name
                    // so the way prisma define whenever you define a uniqueness constraint on multiple fields, it will specify them with '_' between the names
                    age: 10,
                    name: "Kyle"
                }
            }
        }
    )
    console.log('main -> findUnique with new column @@unique block attribute age and name: ', uniqueUser)

    let findFirstUser = await prisma.user.findFirst(
        // we can't search thing like just `name` field
        // name: , -> because `name` field doesn't have uniqueness constaint on it from @@unique
        // but we can use findFirst if there is constaint in `name` field

        // findFirst it allow you to do any property instead findUnique
        {
            where: {
                name: "Kyle",

            }

        }
    )
    console.log('main -> findFirst : ', findFirstUser)


    let findManyUser = await prisma.user.findMany(
        // findMany it is going to find us many users that match "Kyle"
        {
            where: {
                name: "Kyle",

            }

        }
    )
    console.log('main -> findMany : ', findManyUser)


    // pagination and distinct
    findManyUser = await prisma.user.findMany({
        where: {
            name: "Kyle"
        },
        distinct: ["name", "age"]
    })
    console.log('main -> findMany using distinct clause to distinct name and age : ', findManyUser)

    findManyUser = await prisma.user.findMany({
        where: {
            name: "Kyle"
        },
        orderBy: {
            age: "desc"
        },
        take: 2,
        skip: 1
    })
    console.log('main -> findMany using take clause to paginate 1 user and skip clause to skip the first Kyle orderBy clause based on age ascending order: ', findManyUser)

    // another way to filter
    findManyUser = await prisma.user.findMany({
        where: {
            name: {
                equals: "Kyle" // -> value
            }
        },

    })
    console.log('main -> findMany using equal clause filter: ', findManyUser)
    console.log('main -> count findMany using equal clause to equal value : ', findManyUser.length)

    findManyUser = await prisma.user.findMany({
        where: {
            name: {
                not: "Kyle"
            }
        },

    })
    console.log('main -> findMany using not clause to not equal value: ', findManyUser)

    findManyUser = await prisma.user.findMany({
        where: {
            name: {
                in: ["Kyle"]
            }
        },

    })
    console.log('main -> findMany using in clause to include value: ', findManyUser)

    findManyUser = await prisma.user.findMany({
        where: {
            name: {
                notIn: ["Kyle"]
            }
        },

    })
    console.log('main -> findMany using notIn clause to not include value: ', findManyUser)

    findManyUser = await prisma.user.findMany({
        where: {
            age: {
                lt: 100
            }
        },

    })
    console.log('main -> findMany using lt clause to less than value: ', findManyUser)

    findManyUser = await prisma.user.findMany({
        where: {
            name: "Kyle",
            age: {
                lt: 100
            }
        },

    })
    console.log('main -> findMany using lt clause to less than value and have name Kyle: ', findManyUser)

    findManyUser = await prisma.user.findMany({
        where: {
            name: "Kyle",
            age: {
                gt: 0
            }
        },

    })
    console.log('main -> findMany using gt clause to greater than value and have name Kyle: ', findManyUser)
    findManyUser = await prisma.user.findMany({
        where: {
            name: "Kyle",
            age: {
                lte: 100
            }
        },

    })
    console.log('main -> findMany using lt clause to less than equal value and have name Kyle: ', findManyUser)

    findManyUser = await prisma.user.findMany({
        where: {
            name: "Kyle",
            age: {
                gte: 0
            }
        },

    })
    console.log('main -> findMany using gt clause to greater than equal value and have name Kyle: ', findManyUser)

    findManyUser = await prisma.user.findMany({
        // contains : allow us to check if the text contained inside of another piece of test
        where: {
            name: {
                contains: "Kyle"
            }
        },

    })
    console.log('main -> findMany using contains clause to contain the text value : ', findManyUser)

    findManyUser = await prisma.user.findMany({
        // endsWith : allow us to check if the string is at the end
        where: {
            name: {
                endsWith: "@liver.com"
            }
        },

    })
    console.log('main -> findMany using endsWith clause to end the string with value : ', findManyUser)

    findManyUser = await prisma.user.findMany({
        // startsWith : allow us to check if the string is at the start
        where: {
            name: {
                startsWith: "Kyle"
            }
        },

    })
    console.log('main -> findMany using startsWith clause to start the string with value : ', findManyUser)

    // operator
    findManyUser = await prisma.user.findMany({
        where: {
            AND: [
                {
                    name: {
                        startsWith: "Kyle"
                    }
                },
                {
                    email: {
                        endsWith: "@liver.com'"
                    }
                },
                {
                    age: 11
                },
            ]
        },

    })
    console.log('main -> findMany using AND operator with multiple filter: ', findManyUser)
    findManyUser = await prisma.user.findMany({
        where: {
            OR: [
                {
                    name: {
                        startsWith: "Kyle"
                    }
                },
                {
                    email: {
                        endsWith: "@liver.com'"
                    }
                },
                {
                    age: 11
                },
            ]
        },

    })
    console.log('main -> findMany using OR operator with multiple filter: ', findManyUser)

    findManyUser = await prisma.user.findMany({
        where: {
            NOT: [
                {
                    name: {
                        startsWith: "Kyle"
                    }
                },
                {
                    email: {
                        endsWith: "@liver.com'"
                    }
                },
                {
                    age: 11
                },
            ]
        },

    })
    console.log('main -> findMany using NOT operator with multiple filter: ', findManyUser)

    // query on relationship
    findManyUser = await prisma.user.findMany({
        where: {
            userPreference: {
                emailUpdates: true
            }
        },

    })
    console.log('main -> findMany query relationship: ', findManyUser)

    // filter query on relationship
    findManyUser = await prisma.user.findMany({
        where: {
            writtenPosts: {
                // none : none of post have this query
                // every : every of post have this query
                // some : some of post have this query
                every: {
                    title: "Test" // says `is every single post that this person written start with tile of Test if so return the User` 
                }
            }
        },

    })
    console.log('main -> findMany filter query relationship: ', findManyUser)


    // advanced query
    findManyUser = await prisma.user.findMany({
        where: {
            writtenPosts: {
                every: {
                    title: {
                        startsWith: "Test"
                    }
                }
            }
        },

    })
    console.log('main -> findMany advanced query relationship: ', findManyUser)

    // advanced filter query relationship
    let findManyPost = await prisma.post.findMany({
        where: {
            author: {
                is: {
                    age: 11
                },
                // isNot
            }
        },

    })
    console.log('main -> findMany advanced query relationship: ', findManyPost)

    // update -> only update the first user it finds
    let updateUser = await prisma.user.update({
        where: {
            email: "kyleme.test@liver.com"
        },
        data: { // data clause : is the data that we want to update
            email: "fix.test@liver.com"
        }
        // we could use `select` clause and `include` clause in update statement
    })
    console.log('main -> update with filter and update the data : ', updateUser)
    // updateMany -> will update if the match with the data
    const updateManyUser = await prisma.user.updateMany({
        where: {
            name: "Kyle"
        },
        data: { // data clause : is the data that we want to update
            name: "fixkyle1"
        }
        // we could NOT use `select` clause and `include` clause in updateMany statement
    })
    console.log('main -> update many with filter and update the data : ', updateManyUser)

    // advanced update statement

    updateUser = await prisma.user.update({
        where: {
            email: "kyleme1.test@liver.com"
        },
        data: { // data clause : is the data that we want to update
            age: {
                increment: 120, // (increment clause) ->  increament int type to add 120 

            }
        }
        // we could use `select` clause and `include` clause in update statement
    })
    console.log('main -> advances update with filter and update the data : ', updateUser)

    updateUser = await prisma.user.update({
        where: {
            email: "kyleme1.test@liver.com"
        },
        data: { // data clause : is the data that we want to update
            age: {
                decrement: 1,

            }
        }
        // we could use `select` clause and `include` clause in update statement
    })
    console.log('main -> advances update with filter and update the data : ', updateUser)

    updateUser = await prisma.user.update({
        where: {
            email: "fix.test@liver.com"
        },
        data: {
            userPreference: {
                create: {
                    emailUpdates: true
                }
            }
        }
    })
    console.log('main -> (option 1) find and update user preference using directly state : ', updateUser)

    let findUpdatedUser = await prisma.user.findFirst({
        where: {
            email: "fix.test@liver.com"
        },
        include: {
            userPreference: true
        }
    })
    console.log('main -> (option 1) check the user : ', findUpdatedUser)

    const userPreference = await prisma.userPreference.create({
        data: {
            emailUpdates: true
        },
    })
    console.log('main -> (option 2) create user preference1 : ', userPreference)

    updateUser = await prisma.user.update({
        where: {
            email: "kyleme1.test@liver.com"
        },
        data: { // data clause : is the data that we want to update
            userPreference: {
                connect: {
                    id: userPreference.id
                }
            }
        }
        // we could use `select` clause and `include` clause in update statement
    })
    console.log('main -> (option 2) find email and update user preference1 using connect clause : ', updateUser)

    findUpdatedUser = await prisma.user.findFirst({
        where: {
            email: "kyleme1.test@liver.com"
        },
        include: {
            userPreference: true
        }
    })
    console.log('main -> (option 2) check the user : ', findUpdatedUser)


    updateUser = await prisma.user.update({
        where: {
            email: "kyleme1.test@liver.com"
        },
        data: { // data clause : is the data that we want to update
            userPreference: {
                disconnect: true
            }
        }
        // we could use `select` clause and `include` clause in update statement
    })
    console.log('main -> (option 2) find email and update user preference1 using disconnect clause to disconnect the userPreference : ', updateUser)

    const createUser = await prisma.user.create({
        data: { // data clause : is the data that we want to update
            name: `Kyle${Math.floor(Math.random() * 9999)}`,
            email: `kyle.${Math.floor(Math.random() * 9999)}@liver.com`,
            age: 27,
            userPreference: {
                connect: {
                    id: userPreference.id
                }
            }
        }
        // we could use `select` clause and `include` clause in update statement
    })
    console.log('main -> create user preference on create func : ', createUser)


    // delete
    const deleteUser = await prisma.user.delete({
        where: {
            email: "kyleme1.test@liver.com"
        }
    })
    console.log('main -> delete the user with filter : ', deleteUser)

    const deleteManyUser = await prisma.user.deleteMany({
        where: {
            age: {
                gt: 30
            }
        }
    })
    console.log('main -> delete many user with filter : ', deleteManyUser)

}


main()
    .catch((err) => {
        console.log(err)
    }).finally(async () => {
        // I use the $ sign in front of a variable to identify that this variable holds an object.
        await prisma.$disconnect()
    })