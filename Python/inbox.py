from google.appengine.ext import ndb
from google.appengine.api import channel
from handlers import SecureHandler
from models import Message, Conversation


# Handlers for user's inbox.


class InboxHandler(SecureHandler):

    def get(self):
        conversation_id = self.request.get('conversation_id')
        token = channel.create_channel(str(self.user.id))
        self.render_response('inbox.html', conversation_id=conversation_id, token=token)


class ConversationsHandler(SecureHandler):

    def get(self):
        conversations = Conversation.query(Conversation.user_keys == self.user.key,
            Conversation.visibleto_user_keys == self.user.key).order(-Conversation.modified).fetch()
        self.render_json_response(conversations)


class MessagesHandler(SecureHandler):

    def get(self, conversation_id):
        conversation = ndb.Key(Conversation, int(conversation_id)).get()

        if self.user.key not in conversation.user_keys:
            return self.render_json_error('You are not allowed to view this conversation', 403)

        messages = Message.query(Message.conversation_key == conversation.key,
            Message.visibleto_user_keys == self.user.key).order(Message.created).fetch()

        self.render_json_response(messages)

    def post(self, conversation_id):
        conversation = ndb.Key(Conversation, int(conversation_id)).get()

        if self.user.key in conversation.unreadby_user_keys:
            conversation.unreadby_user_keys.remove(self.user.key)
            conversation.put()


class SendConversationMessageHandler(SecureHandler):

    def post(self, conversation_id):
        conversation = ndb.Key(Conversation, int(conversation_id)).get()

        if not conversation or self.user.key not in conversation.visibleto_user_keys:
            return self.abort(404)

        message = Message(conversation_key=conversation.key, sender_key=self.user.key, body=self.request.body)
        message.put()

        message.process()
        self.render_json_response(message)