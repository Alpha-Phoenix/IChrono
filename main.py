import os
import jinja2
import webapp2
import json

from google.appengine.ext import db
from google.appengine.api import users

template_dir = os.path.join(os.path.dirname(__file__), 'templates')
jinja_env = jinja2.Environment(loader = jinja2.FileSystemLoader(template_dir), autoescape = True)

class Times(db.Model):
	time = db.StringProperty(multiline = False)


class Handler(webapp2.RequestHandler):
	def write(self, *a, **kw):
		self.response.out.write(*a, **kw)

	def render_str(self, template, **params):
		t = jinja_env.get_template(template)
		return t.render(params)

	def render(self, template, **kw):
		self.write(self.render_str(template, **kw))

class MainPage(Handler):
    def get(self):
    	alltimes = db.GqlQuery("SELECT * FROM Times")
        self.render("index.html", alltimes = alltimes)
    def post(self):
    	newtime = Times()
    	newtime.time = self.request.get('time')
    	newtime.put()
    	self.response.out.write(self.request.get('time'))

class Clear(Handler):
	def get(self):
		db.delete(db.Query())
		self.redirect('/')

app = webapp2.WSGIApplication([
    ('/', MainPage),('/times', MainPage), ('/clear', Clear)
], debug=True)
