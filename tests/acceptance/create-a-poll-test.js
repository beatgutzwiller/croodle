import Ember from "ember";
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import Pretender from 'pretender';
import serverPostPolls from '../helpers/server-post-polls';
import formattedDateHelper from 'croodle/helpers/formatted-date';
/* global moment */
/* jshint proto: true */

var application, server;

module('Acceptance | create a poll', {
  beforeEach: function() {
    application = startApp();
    application.__container__.lookup('adapter:application').__proto__.namespace = '';
    
    server = new Pretender();

    var lastCreatedPoll = {};
  
    server.post('/polls',
      function (request) {
        var ret = serverPostPolls(request.requestBody, 'test');
        lastCreatedPoll = ret[2];
        return ret;
      }
    );

    server.get('/polls/test',
      function () {
        return [
          200,
          {"Content-Type": "application/json"},
          lastCreatedPoll
        ];
      }
    );
  },
  afterEach: function() {
    server.shutdown();
    
    Ember.run(application, 'destroy');
  }
});

test("create a default poll", function(assert) { 
  visit('/create').then(function() {
    click('.button-next');
    
    andThen(function(){
      assert.equal(currentPath(), 'create.meta');
      
      fillIn('input[name="model.title"]', 'default poll');
      click('.button-next');
      
      andThen(function(){
        assert.equal(currentPath(), 'create.options');
        
        // select days in calendar
        // today and last day on current calendar page
        click('.datepicker tbody td.today');
        click('.datepicker tbody tr:last-child td:last-child');
        
        click('.button-next');
        
        andThen(function(){
          assert.equal(currentPath(), 'create.settings');
          
          click('.button-next');
          
          andThen(function(){
            assert.equal(currentPath(), 'poll');
            
            pollTitleEqual(assert, 'default poll');
            pollDescriptionEqual(assert, '');
             
            assert.equal(
              find('.user-selections-table thead tr th').length,
              4, // head of user selections table is options + leading column (user names) + last column (buttons)
              'there are two options provided'
            );
            
            assert.equal(
              find(find('.user-selections-table thead tr th')[1]).text().trim(),
              formattedDateHelper(new Date()),
              'today is the first selected option'
            );
            
            pollHasAnswers(assert, [
              Ember.I18n.t('answerTypes.yes.label'),
              Ember.I18n.t('answerTypes.no.label')
            ]);

            pollHasUsersCount(assert, 0);
          });
        });
      });
    });
  });
});

test("create a poll for answering a question", function(assert) {
  visit('/create').then(function() {
    // select poll type answer a question
    fillIn('select[name="pollType"]', 'MakeAPoll');
    click('.button-next');
    
    andThen(function(){
      assert.equal(currentPath(), 'create.meta');
      
      fillIn('input[name="model.title"]', 'default poll');
      click('.button-next');
      
      andThen(function(){
        assert.equal(currentPath(), 'create.options');
        
        // fill in default two option input fields
        fillIn(find('input')[0], 'option a');
        fillIn(find('input')[1], 'option b');
        
        // add another option input field
        assert.equal(find('input').length, 2);
        click('.button-more-options');
        andThen(function(){
          assert.equal(find('input').length, 3);
          fillIn(find('input')[2], 'option c');

          click('.button-next');

          andThen(function(){
            assert.equal(currentPath(), 'create.settings');

            click('.button-next');

            andThen(function(){
              assert.equal(currentPath(), 'poll');

              pollTitleEqual(assert, 'default poll');
              pollDescriptionEqual(assert, '');
              pollHasOptions(assert, ['option a', 'option b', 'option c']);
              pollHasUsersCount(assert, 0);
            });
          });
        });
      });
    });
  });
});

test("create a poll with description", function(assert) {
  visit('/create').then(function() {
    click('.button-next');
    
    andThen(function(){
      assert.equal(currentPath(), 'create.meta');
      
      fillIn('input[name="model.title"]', 'default poll');
      fillIn('textarea', 'a sample description');
      click('.button-next');
      
      andThen(function(){
        assert.equal(currentPath(), 'create.options');
        
        // select days in calendar
        // today and last day on current calendar page
        click('.datepicker tbody td.today');
        click('.datepicker tbody tr:last-child td:last-child');
        
        click('.button-next');
        
        andThen(function(){
          assert.equal(currentPath(), 'create.settings');
          
          click('.button-next');
          
          andThen(function(){
            assert.equal(currentPath(), 'poll');
            
            pollTitleEqual(assert, 'default poll');
            pollDescriptionEqual(assert, 'a sample description');
            
            // check that there are two options
            // head of user selections table is options + leading column (user names) + last column (buttons)
            assert.equal(find('.user-selections-table thead tr th').length, 4);
            
            assert.equal(find(
              Ember.$('.user-selections-table thead tr th')[1]).text().trim(),
              formattedDateHelper(new Date()),
              'current date should be first option'
            );

            pollHasUsersCount(assert, 0);
          });
        });
      });
    });
  });
});