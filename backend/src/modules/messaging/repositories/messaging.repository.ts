import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
} from '../schemas/conversation.schema';
import { Message, MessageDocument } from '../schemas/message.schema';

@Injectable()
export class MessagingRepository {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  async createConversation(
    data: Partial<Conversation>,
  ): Promise<ConversationDocument> {
    return this.conversationModel.create(data);
  }

  async findConversationById(id: string): Promise<ConversationDocument | null> {
    return this.conversationModel.findById(id).exec();
  }

  async findByParticipantsAndApplication(
    participantIds: string[],
    applicationId: string,
  ): Promise<ConversationDocument | null> {
    return this.conversationModel
      .findOne({
        applicationId: new Types.ObjectId(applicationId),
        participantIds: {
          $all: participantIds.map((id) => new Types.ObjectId(id)),
        },
      })
      .exec();
  }

  async listForUser(userId: string): Promise<ConversationDocument[]> {
    return this.conversationModel
      .find({ participantIds: new Types.ObjectId(userId) })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .exec();
  }

  async updateConversation(
    id: string,
    update: Partial<Conversation>,
  ): Promise<ConversationDocument | null> {
    return this.conversationModel
      .findByIdAndUpdate(id, update, { returnDocument: 'after' })
      .exec();
  }

  async createMessage(data: Partial<Message>): Promise<MessageDocument> {
    return this.messageModel.create(data);
  }

  async listMessages(
    conversationId: string,
    page: number,
    limit: number,
  ): Promise<{ items: MessageDocument[]; total: number }> {
    const query = { conversationId: new Types.ObjectId(conversationId) };
    const [items, total] = await Promise.all([
      this.messageModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.messageModel.countDocuments(query),
    ]);
    return { items, total };
  }

  async markRead(
    messageId: string,
    userId: string,
  ): Promise<MessageDocument | null> {
    return this.messageModel
      .findByIdAndUpdate(
        messageId,
        { $addToSet: { readBy: new Types.ObjectId(userId) } },
        { returnDocument: 'after' },
      )
      .exec();
  }
}
