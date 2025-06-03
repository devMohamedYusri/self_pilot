export const AI_FUNCTIONS = [
    {
      name: 'create_task',
      description: 'Create a new task for the user',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'The title of the task'
          },
          description: {
            type: 'string',
            description: 'Detailed description of the task'
          },
          dueDate: {
            type: 'string',
            description: 'Due date in ISO format (YYYY-MM-DD)'
          },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            description: 'Priority level of the task'
          }
        },
        required: ['title']
      }
    },
    {
      name: 'create_goal',
      description: 'Create a new goal for the user',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'The title of the goal'
          },
          description: {
            type: 'string',
            description: 'Detailed description of the goal'
          },
          targetDate: {
            type: 'string',
            description: 'Target completion date in ISO format'
          }
        },
        required: ['title']
      }
    },
    {
      name: 'create_habit',
      description: 'Create a new habit to track',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'The name of the habit'
          },
          description: {
            type: 'string',
            description: 'Description of the habit'
          },
          frequency: {
            type: 'string',
            enum: ['daily', 'weekly', 'monthly'],
            description: 'How often to perform the habit'
          }
        },
        required: ['title', 'frequency']
      }
    },
    {
      name: 'create_routine',
      description: 'Create a new routine with steps',
      parameters: {
        type: 'object',
        properties: {
            title: {
              type: 'string',
              description: 'The name of the routine'
            },
            description: {
              type: 'string',
              description: 'Description of the routine'
            },
            timeOfDay: {
              type: 'string',
              enum: ['morning', 'afternoon', 'evening'],
              description: 'When to perform the routine'
            },
            steps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: {
                    type: 'string',
                    description: 'Step description'
                  },
                  duration: {
                    type: 'number',
                    description: 'Duration in minutes'
                  }
                }
              }
            }
          },
          required: ['title', 'timeOfDay']
        }
      },
      {
        name: 'create_journal_entry',
        description: 'Create a new journal entry',
        parameters: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Title of the journal entry'
            },
            content: {
              type: 'string',
              description: 'Content of the journal entry'
            },
            mood: {
              type: 'string',
              enum: ['happy', 'sad', 'excited', 'anxious', 'calm', 'angry', 'grateful'],
              description: 'Current mood'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Tags for the entry'
            }
          },
          required: ['title', 'content']
        }
      },
      {
        name: 'list_tasks',
        description: 'List all tasks or filter by status',
        parameters: {
          type: 'object',
          properties: {
            completed: {
              type: 'boolean',
              description: 'Filter by completion status'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Filter by priority'
            }
          }
        }
      },
      {
        name: 'update_task_status',
        description: 'Mark a task as complete or incomplete',
        parameters: {
          type: 'object',
          properties: {
            taskId: {
              type: 'string',
              description: 'ID of the task to update'
            },
            completed: {
              type: 'boolean',
              description: 'New completion status'
            }
          },
          required: ['taskId', 'completed']
        }
      }
    ]
    
    export const SYSTEM_PROMPT = `You are LifePilot, an AI assistant designed to help users manage their tasks, goals, habits, routines, and journal entries.
    
    Your capabilities include:
    1. Creating and managing tasks with priorities and due dates
    2. Setting and tracking goals with progress monitoring
    3. Establishing habits and tracking streaks
    4. Building daily routines with timed steps
    5. Encouraging journaling and mood tracking
    
    Guidelines:
    - Be proactive in suggesting ways to improve productivity and well-being
    - When users mention activities, suggest creating appropriate tasks, habits, or routines
    - Encourage regular journaling for mental health
    - Break down large goals into smaller, actionable tasks
    - Suggest realistic timelines and priorities
    - Be supportive and motivating
    - Use the provided functions to create items in the user's system
    
    Remember: All items you create will be marked as "AI suggested" and require user approval before becoming active.`  