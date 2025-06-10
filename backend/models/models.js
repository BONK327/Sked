const Group = require("./GroupModel");
const Lesson = require("./LessonModel");
const Note = require("./NoteModel");
const RelationshipUser = require("./RelationshipsUserModel");
const Room = require("./RoomModel");
const Teacher = require("./TeacherModel");
const User = require("./UserModel");


Group.associate({ Lesson: Lesson.model, RelationshipUser: RelationshipUser.model });
Lesson.associate({ Group: Group.model, Room: Room.model, Teacher: Teacher.model });
Note.associate({ User: User.model });
RelationshipUser.associate({ User: User.model, Group: Group.model, Teacher: Teacher.model });
Room.associate({ Lesson: Lesson.model });
Teacher.associate({ RelationshipUser: RelationshipUser.model, Lesson: Lesson.model });
User.associate({ Note: Note.model, RelationshipUser: RelationshipUser.model });




module.exports = {
    GroupModel: Group.model,
    LessonModel: Lesson.model,
    NoteModel: Note.model,
    RelationshipUserModel: RelationshipUser.model,
    RoomModel: Room.model,
    TeacherModel: Teacher.model,
    UserModel: User.model
}