const Author = require('./models/Author')
const Book = require('./models/Book')
const User = require('./models/User')
const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (!args.author && !args.genre) {
        const books = await Book.find({})
        const populatedBooks = books.map((book) => book.populate('author'))
        return populatedBooks
      } else if (args.author && !args.genre) {
        let books = await Book.find({})
        books = await Promise.all(books.map((book) => book.populate('author')))
        const filteredBooks = books.filter(
          (book) => book.author.name === args.author
        )
        return filteredBooks
      } else if (args.genre && !args.author) {
        const books = await Book.find({ genres: args.genre })
        const populatedBooks = books.map((book) => book.populate('author'))
        console.log(populatedBooks)
        return populatedBooks
        //return books.filter((book) => book.genres.includes(args.genre))
      } else {
        const books = await Book.find({ genres: args.genre })
        const populateBooks = await books.map((book) => book.populate('author'))
        console.log('populated', populateBooks)
        const booksByAuthor = populateBooks.filter(
          (book) => book.author.name === args.author
        )
        return booksByAuthor
      }
    },
    allAuthors: async (root, args) => {
      return Author.find({})
    },
    me: async (root, args, context) => {
      return context.currentUser
    },
  },
  Author: {
    bookCount: async (root) => {
      //const booksByAuthor = await Book.find({ author: author._id })
      //return booksByAuthor.length

      // lisätty Authorille kirjat viitteinä (authorOf), nyt bookCount palauttaa kirjojen lukumäärän
      // suoraan Authorin perusteella (n+1 pulman ratkaisuun)
      return root.authorOf ? root.authorOf.length : 0
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        console.log('not authenticated')
        throw new GraphQLError('not authenticated', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      let author = await Author.findOne({ name: args.author })

      if (!author) {
        author = new Author({ name: args.author, authorOf: [] })

        try {
          await author.save()
        } catch (error) {
          console.log(error)
          throw new GraphQLError('Saving author failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.author,
              error,
            },
          })
        }
      }

      const book = new Book({ ...args, author: author._id })

      try {
        await book.save()
        await book.populate('author')

        await Author.findByIdAndUpdate(author._id, {
          $push: { authorOf: book._id },
        })
      } catch (error) {
        throw new GraphQLError('Saving book failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.title,
            error,
          },
        })
      }

      pubsub.publish('BOOK_ADDED', { bookAdded: book })
      return book
    },
    addAuthor: async (root, args) => {
      const author = new Author({ ...args })
      try {
        await author.save()
      } catch (error) {
        throw new GraphQLError('Saving author failed', {
          extensions: { code: 'BAD_USER_INPUT', invalidArgs: args.name, error },
        })
      }
      return author
    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }
      const author = await Author.findOne({ name: args.name })
      try {
        author.born = args.setBornTo
        await author.save()
        return author
      } catch (error) {
        throw new GraphQLError('setting birth year failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.setBornTo,
            error,
          },
        })
      }
      return author
    },
    createUser: async (root, args) => {
      const user = new User({ ...args })
      try {
        await user.save()
      } catch (error) {
        throw new GraphQLError('Creating user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.username,
            error,
          },
        })
      }
      return user
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      if (!user || args.password !== 'secret') {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }
      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED'),
    },
  },
}

module.exports = resolvers
