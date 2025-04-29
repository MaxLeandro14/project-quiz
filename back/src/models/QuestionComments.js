import { DataTypes, Model } from 'sequelize';

class QuestionComments extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4
        },
        question_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "questions", key: "id" },
          onDelete: "CASCADE"
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "users", key: "id" },
          onDelete: "CASCADE"
        },
        comment: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        parent_comment_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { 
            model: "question_comments", 
            key: "id" 
          },
          onDelete: "CASCADE"
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
      },
      {
        sequelize,
        modelName: 'QuestionComments',
        tableName: 'question_comments',
        underscored: true
      }
    );
  }
}

export default QuestionComments;
