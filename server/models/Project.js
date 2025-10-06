import mongoose from 'mongoose'

const TaskSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dueDate: Date,
    completedAt: Date
  },
  { timestamps: true }
)

const TeamMemberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: String,
    permissions: [{ type: String }]
  },
  { _id: false }
)

const ProjectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    description: String,
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    status: { 
      type: String, 
      enum: ['active', 'on-hold', 'completed', 'cancelled'], 
      default: 'active' 
    },
    priority: { 
      type: String, 
      enum: ['low', 'medium', 'high'], 
      default: 'medium' 
    },
    startDate: Date,
    endDate: Date,
    budget: Number,
    technologies: [{ type: String }],
    tasks: [TaskSchema],
    teamMembers: [TeamMemberSchema],
    notes: String,
    progress: { type: Number, default: 0, min: 0, max: 100 }
  },
  { timestamps: true }
)

// Calculate progress based on completed tasks
ProjectSchema.pre('save', function(next) {
  if (this.tasks && this.tasks.length > 0) {
    const completedTasks = this.tasks.filter(task => task.status === 'completed').length;
    this.progress = Math.round((completedTasks / this.tasks.length) * 100);
  }
  next();
});

export default mongoose.model('Project', ProjectSchema)
