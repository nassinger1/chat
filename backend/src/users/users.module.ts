import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { HashingModule } from "@/security/hashing/hashing.module.js";
import { UsersHttpController } from "./controllers/users-http.controller.js";
import { CreateUserHandler } from "./handlers/create-user.handler.js";
import { UserRepository } from "./repositories/user.repository.js";
import { UserDocument, UserSchema } from "./user.schema.js";

@Module({
  imports: [
    HashingModule,
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
    ]),
  ],
  controllers: [UsersHttpController],
  providers: [UserRepository, CreateUserHandler],
  exports: [UserRepository],
})
export class UsersModule {}
