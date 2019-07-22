const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const bodyParser = require('body-parser');

const models = require('./src/database/database');

const PORT = 4000;
const app = express();

// set use body json
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

const typeDefs = gql`
  type Message {
    id: Int!
    text: String!
  }
  type Query {
    allMessages: [Message]
    fetchMessage(id: Int!): Message
  }
  type Mutation {
    createMessage(text: String!): Message
    updateMessage(id: Int!, text: String!): Message
  }
`;

const resolvers = {
  Query: {
    allMessages: async (parent, args, { models }) => {
      return await models.message.findAll({
        order: [['id', 'DESC']]
      });
    },

    fetchMessage: async (parent, { id }, { models }) => {
      return await models.message.findOne({
        where: { id: id }
      });
    }
  },
  Mutation: {
    createMessage: async (parent, { text }, { models }) => {
      try {
        const message = await models.message.create({ text });
        return message;
      } catch (err) {
        console.log(err);
      }
    },
    updateMessage: async (parent, { id, text }, { models }) => {
      const message = await models.message.findOne({
        where: { id: id }
      });
      const messageUpdate = await message.update({ text });
      return messageUpdate;
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: { models }
});

server.applyMiddleware({ app });

models.realworld
  // .sync({ force: true })
  .sync()
  .then(() =>
    app.listen({ port: 4000 }, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    })
  )
  .catch((error) => {
    console.log(error);
  });
