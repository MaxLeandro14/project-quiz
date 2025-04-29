import { DataTypes, Model } from 'sequelize';

class Question extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        material_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'materials', key: 'id' },
          onDelete: 'SET NULL',
        },
        question: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        type: {
          type: DataTypes.ENUM("MULTIPLA_ESCOLHA", "EXPLICATIVA", "VERDADEIRO_FALSO"),
          allowNull: false,
        },
        options: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        correct_opt: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        is_correct_v_f: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        explanation: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        likes: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        modelName: 'Question',
        tableName: 'questions',
        underscored: true
      }
    );
  }
}

export default Question;
