var assert = require('assert');
var mongoose = require('mongoose');
var Types = mongoose.Schema.Types;
var ObjectId = Types.ObjectId;
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/populate_virtuals');
var db = mongoose;

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
      model: 'gh4261_0',

      //BLOCK 1
      populate: {                  //this works
        path: 'comments.author',
        model: 'gh4261'
      }

      //BLOCK 2
      // populate: {
      //   path: 'comments.author',
      //   model: Person,
      //   populate: {                //inner 'blogPosts' doesn't populate
      //     path: 'blogPosts',
      //     model: BlogPost
      //   }
      // }

      //BLOCK 3
      // populate: {                  //causes "blogPosts" path to return empty array
      //   path: 'author',
      //   model: Person
      // }
    }).
    exec(function(error, person) {
      console.log(person.blogPosts[0]);
      assert.ifError(error);
      assert.equal(person.blogPosts[0].comments[0].author.name,
        'Test');
    });
  });
});

