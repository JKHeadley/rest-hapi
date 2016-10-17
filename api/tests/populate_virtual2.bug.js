var assert = require('assert');
var mongoose = require('mongoose');
var Types = mongoose.Schema.Types;
var ObjectId = Types.ObjectId;
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/populate_virtuals');
var db = mongoose;

var roleSchema = new mongoose.Schema({
  name: Types.String,
  puppy: { type: Types.ObjectId, ref: 'dog' }
});

roleSchema.virtual('people', {
  ref: 'user',
  localField: '_id',
  foreignField: 'title',
});

var userSchema = new mongoose.Schema({
  name: Types.String,
  title: { type: Types.ObjectId, ref: 'role' },
  pastTitles: [{ title: { type: Types.ObjectId, ref: 'role' } }],
  pup: { type: Types.ObjectId, ref: 'user' }
});

var dogSchema = new mongoose.Schema({
  name: Types.String,
  owner: { type: Types.ObjectId, ref: 'user' }
});

var Role = mongoose.model('role', roleSchema);
var User = mongoose.model('user', userSchema);
var Dog = mongoose.model('dog', dogSchema);

var dog = {
  name: "woofy"
};
Dog.create(dog, function(error, dog) {
  assert.ifError(error);
  var roles = [
    { name: 'Admin', puppy: dog._id },
    { name: 'Super', puppy: dog._id }
  ];
  Role.create(roles, function(error, roles) {
    var user = {
      name: 'Test1',
      title: roles[0]._id,
      pastTitles: [{ title: roles[1]._id }],
      pup: dog._id
    };
    User.create(user, function(error) {
      assert.ifError(error);
      Role.findById(roles[0]._id).
      populate({
        path: 'people',
        model: User,
        // populate: {
        //   path: 'pastTitles.title',
        //   model: Role,
        //   populate: {//populates
        //     path: 'puppy',
        //     model: Dog
        //   }
        // }
        // populate: {
        //   path: 'pastTitles.title',
        //   model: Role,
        //   populate: {//doesn't populate
        //     path: 'people',
        //     model: User
        //   }
        // }
        // populate: {//causes "people" path to return empty array
        //   path: 'title',
        //   model: Role
        // }
      }).
      exec(function(error, role) {
        Log.debug(role.people[0].pastTitles[0].title);
      });
    });
  })
});


delete mongoose.models.user;
delete mongoose.modelSchemas.user;
delete mongoose.models.role;
delete mongoose.modelSchemas.role;


// test('deep populate2', function (t) {
//   var roleSchema = new mongoose.Schema({
//     name: Types.String
//   });
//
//   roleSchema.virtual('people', {
//     ref: 'user',
//     localField: '_id',
//     foreignField: 'title'
//   });
//
//   var userSchema = new mongoose.Schema({
//     name: Types.String,
//     title: { type: Types.ObjectId }
//   });
//
//   var Role = mongoose.model('role', roleSchema);
//   var User = mongoose.model('user', userSchema);
//
//   var roles = [
//     { name: 'Admin' },
//     { name: 'Super' }
//   ];
//
//   Role.create(roles, function(error, roles) {
//     assert.ifError(error);
//     var users = [
//       {
//         name: 'Test1',
//         title: roles[0]._id
//       },
//       {
//         name: 'Test2',
//         title: roles[1]._id
//       },
//       {
//         name: 'Test3',
//         title: roles[0]._id
//       }
//     ];
//     User.create(users, function(error) {
//       assert.ifError(error);
//       Role.findById(roles[0]._id).
//       populate({
//         path: 'people',
//         model: User,
//         populate: {
//           path: 'title',
//           model: Role
//         }
//       }).
//       exec(function(error, role) {
//         console.log(role.people);
//       });
//     });
//   });
//
//
//   delete mongoose.models.user;
//   delete mongoose.modelSchemas.user;
//   delete mongoose.models.role;
//   delete mongoose.modelSchemas.role;
//
//   t.end();
// });

var PersonSchema = new Schema({
  name: String
});

PersonSchema.virtual('blogPosts', {
  ref: 'gh4261',
  localField: '_id',
  foreignField: 'author'
});

var BlogPostSchema = new Schema({
  title: String,
  author: { type: ObjectId },
  comments: [{ author: { type: ObjectId, ref: 'gh4261' } }]
});

var Person = db.model('gh4261', PersonSchema);
var BlogPost = db.model('gh4261_0', BlogPostSchema);

var people = [
  { name: 'Val' },
  { name: 'Test' }
];

Person.create(people, function(error, people) {
  assert.ifError(error);
  var post = {
    title: 'Test1',
    author: people[0]._id,
    comments: [{ author: people[1]._id }]
  };
  BlogPost.create(post, function(error) {
    assert.ifError(error);
    Person.findById(people[0]._id).
    populate({
      path: 'blogPosts',
      model: BlogPost,
      // populate: {
      //   path: 'comments.author',
      //   model: Person
      // }
      // populate: {
      //   path: 'comments.author',
      //   model: Person,
      //   populate: {//doesn't populate
      //     path: 'blogPosts',
      //     model: BlogPost
      //   }
      // }
      populate: {//causes "blogPosts" path to return empty array
        path: 'author',
        model: Person
      }
    }).
    exec(function(error, person) {
      console.log(person.blogPosts[0]);
      assert.ifError(error);
      assert.equal(person.blogPosts[0].comments[0].author.name,
        'Test');
    });
  });
});

