import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from 'croodle/tests/helpers/start-app';
import Pretender from 'pretender';
import serverGetPolls from '../helpers/server-get-polls';
/* jshint proto: true */
/* global jstz, moment, start, stop */

var application, server;

module('Acceptance | view poll', {
  beforeEach: function() {
    application = startApp();
    application.__container__.lookup('adapter:application').__proto__.namespace = '';
    
    server = new Pretender();
  },
  afterEach: function() {
    server.shutdown();
    
    Ember.run(application, 'destroy');
  }
});

test('view a poll with dates', function(assert) {
  var id = 'test',
      encryptionKey = 'abcdefghijklmnopqrstuvwxyz0123456789';
  
  server.get('/polls/' + id, function() {
    return serverGetPolls(
      {
        id: id,
        options: [
          {title: '2015-12-12'},
          {title: '2016-01-01'}
        ]
      }, encryptionKey
    );
  });

  visit('/poll/' + id + '?encryptionKey=' + encryptionKey).then(function() {
    pollHasOptions(assert, [
      moment('2015-12-12').format(
        moment.localeData().longDateFormat('LLLL')
        .replace(
          moment.localeData().longDateFormat('LT'), '')
        .trim()
      ),
      moment('2016-01-01').format(
        moment.localeData().longDateFormat('LLLL')
        .replace(
          moment.localeData().longDateFormat('LT'), '')
        .trim()
      )
    ]);
  });
});

test('view a poll with dates and times', function(assert) {
  var id = 'test',
      encryptionKey = 'abcdefghijklmnopqrstuvwxyz0123456789',
      timezone = jstz.determine().name();
  
  server.get('/polls/' + id, function() {
    return serverGetPolls(
      {
        id: id,
        isDateTime: true,
        options: [
          {title: '2015-12-12T11:11:00.000Z'},
          {title: '2016-01-01T11:11:00.000Z'}
        ],
        timezone: timezone
      }, encryptionKey
    );
  });

  visit('/poll/' + id + '?encryptionKey=' + encryptionKey).then(function() {
    pollHasOptionsDates(assert, [
      moment.tz('2015-12-12T11:11:00.000Z', timezone).format(
        moment.localeData().longDateFormat('LLLL')
        .replace(
          moment.localeData().longDateFormat('LT'), '')
        .trim()
      ),
      moment.tz('2016-01-01T11:11:00.000Z', timezone).format(
        moment.localeData().longDateFormat('LLLL')
        .replace(
          moment.localeData().longDateFormat('LT'), '')
        .trim()
      )
    ]);

    pollHasOptionsTimes(assert, [
      moment.tz('2015-12-12T11:11:00.000Z', timezone).format('LT'),
      moment.tz('2016-01-01T11:11:00.000Z', timezone).format('LT'),
    ]);
  });
});

test('view a poll while timezone differs from the one poll got created in and choose local timezone', function(assert) {
  var id = 'test',
      encryptionKey = 'abcdefghijklmnopqrstuvwxyz0123456789',
      timezoneLocal = jstz.determine().name(),
      timezonePoll;

  if(timezoneLocal !== 'America/Caracas') {
    timezonePoll = 'America/Caracas';
  }
  else {
    timezonePoll = 'Europe/Moscow';
  }
  
  server.get('/polls/' + id, function() {
    return serverGetPolls(
      {
        id: id,
        isDateTime: true,
        options: [
          {title: '2015-12-12T11:11:00.000Z'},
          {title: '2016-01-01T11:11:00.000Z'}
        ],
        timezone: timezonePoll
      }, encryptionKey
    );
  });

  visit('/poll/' + id + '?encryptionKey=' + encryptionKey).then(function() {
    stop();
    Ember.run.later(function(){
      start();
      
      assert.equal(
        find('.modal').css('display'),
        'block',
        'user gets asked which timezone should be used'
      );

      click('.modal button.use-local-timezone');

      andThen(function() {       
        pollHasOptionsDates(assert, [
          moment.tz('2015-12-12T11:11:00.000Z', timezoneLocal).format(
            moment.localeData().longDateFormat('LLLL')
            .replace(
              moment.localeData().longDateFormat('LT'), '')
            .trim()
          ),
          moment.tz('2016-01-01T11:11:00.000Z', timezoneLocal).format(
            moment.localeData().longDateFormat('LLLL')
            .replace(
              moment.localeData().longDateFormat('LT'), '')
            .trim()
          )
        ]);

        pollHasOptionsTimes(assert, [
          moment.tz('2015-12-12T11:11:00.000Z', timezoneLocal).format('LT'),
          moment.tz('2016-01-01T11:11:00.000Z', timezoneLocal).format('LT'),
        ]);

        stop();
        Ember.run.later(function(){
          start();
          
          assert.equal(
            find('.modal').css('display'),
            'none',
            'modal is closed'
          );
        }, 1000);
      });
    }, 1000);
  });
});

test('view a poll while timezone differs from the one poll got created in and choose poll timezone', function(assert) {
  var id = 'test',
      encryptionKey = 'abcdefghijklmnopqrstuvwxyz0123456789',
      timezoneLocal = jstz.determine().name(),
      timezonePoll;

  if(timezoneLocal !== 'America/Caracas') {
    timezonePoll = 'America/Caracas';
  }
  else {
    timezonePoll = 'Europe/Moscow';
  }
  
  server.get('/polls/' + id, function() {
    return serverGetPolls(
      {
        id: id,
        isDateTime: true,
        options: [
          {title: '2015-12-12T11:11:00.000Z'},
          {title: '2016-01-01T11:11:00.000Z'}
        ],
        timezone: timezonePoll
      }, encryptionKey
    );
  });

  visit('/poll/' + id + '?encryptionKey=' + encryptionKey).then(function() {
    stop();
    Ember.run.later(function(){
      start();
      
      assert.equal(
        find('.modal').css('display'),
        'block',
        'user gets asked which timezone should be used'
      );

      click('.modal button.use-poll-timezone');

      andThen(function() {
        pollHasOptionsDates(assert, [
          moment.tz('2015-12-12T11:11:00.000Z', timezonePoll).format(
            moment.localeData().longDateFormat('LLLL')
            .replace(
              moment.localeData().longDateFormat('LT'), '')
            .trim()
          ),
          moment.tz('2016-01-01T11:11:00.000Z', timezonePoll).format(
            moment.localeData().longDateFormat('LLLL')
            .replace(
              moment.localeData().longDateFormat('LT'), '')
            .trim()
          )
        ]);

        pollHasOptionsTimes(assert, [
          moment.tz('2015-12-12T11:11:00.000Z', timezonePoll).format('LT'),
          moment.tz('2016-01-01T11:11:00.000Z', timezonePoll).format('LT')
        ]);

        stop();
        Ember.run.later(function(){
          start();
          
          assert.equal(
            find('.modal').css('display'),
            'none',
            'modal is closed'
          );
        }, 1000);
      });
    }, 1000);
  });
});