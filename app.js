const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const bodyParser = require('body-parser');
const { createWriteStream, existsSync, mkdirSync, unlink, writeFileSync, createReadStream } = require('fs');

//image
// const multer = require('multer');
const path = require('path');

const models = require('./src/database/database');
const { storeFS } = require('./src/uploadfile');

const PORT = 4000;
const app = express();

// app.use(cors());

// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'images');
//   },
//   filename: (req, file, cb) => {
//     cb(null, new Date().toISOString() + '-' + file.originalname);
//   }
// });

// const fileFilter = (req, file, cb) => {
//   console.log('TCL: fileFilter -> file', file);
//   if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

// const storeUpload = ({ stream, filename }) =>
//   new Promise((resolve, reject) =>
//     stream
//       .pipe(createWriteStream(filename))
//       .on('finish', () => resolve())
//       .on('error', reject)
//   );

// set use body json
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

const typeDefs = gql`
  type Message {
    id: Int!
    text: String!
  }
  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }
  type Query {
    allMessages: [Message]
    fetchMessage(id: Int!): Message
    uploads: [File]
  }
  type Mutation {
    createMessage(text: String!): Message
    updateMessage(id: Int!, text: String!): Message
    singleUpload(file: Upload!): File!
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
    },
    uploads: (parent, args) => {}
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
    },
    singleUpload: async (parent, args) => {
      // console.log('TCL: args', args);

      // const { stream, filename } = await args.file;
      const { createReadStream, filename, mimetype, encoding } = await args.file;
      // const { filename, mimetype, encoding } = await args.file;
      // console.log('TCL: filename', filename);
      try {
        if (mimetype === 'image/png' || mimetype === 'image/jpg' || mimetype === 'image/jpeg') {
          if (existsSync(path.join(__dirname, './images'))) {
            console.log('dub');
            //rename file
            // const file = new Date().toISOString() + '-' + filename;
            if (existsSync('./images/66772569_2315018925252113_6299043751218118656_o.jpg')) {
              console.log('dubbbbbb');
              unlink('./images/66772569_2315018925252113_6299043751218118656_o.jpg', function(err) {
                if (err) throw err;
                console.log('File deleted!');
              });
            }
            const stream = createReadStream();
            const pathfile = './images';
            const { path } = await storeFS({ pathfile, stream, filename });
            console.log('TCL: path', path);
          } else {
            mkdirSync(path.join(__dirname, './images'));
            console.log('create folder');
          }
        } else {
          throw new Error('filed type not image');
        }
      } catch (err) {
        console.log(err);
      }

      // await storeUpload({ stream, filename });
      // return true;
      return {
        filename: filename,
        mimetype: mimetype,
        encoding: encoding
      };
      // return args.file.then((file) => {
      //   //Contents of Upload scalar: https://github.com/jaydenseric/graphql-upload#class-graphqlupload
      //   //file.stream is a node stream that contains the contents of the uploaded file
      //   //node stream api: https://nodejs.org/api/stream.html
      //   return file;
      // });
    }
  }
};
// existsSync(path.join(__dirname, './images')) || mkdirSync(path.join(__dirname, './images'));
const server = new ApolloServer({
  cors: {
    origin: '*', // <- allow request from all domains
    credentials: true
  },
  typeDefs,
  resolvers,
  context: { models },
  uploads: {
    maxFileSize: 10000000, // 10 MB
    maxFiles: 20
  }
});
app.use('/images', express.static(path.join(__dirname, './images')));

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
