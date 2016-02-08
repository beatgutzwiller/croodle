import Ember from 'ember';
import {
  validator, buildValidations
}
from 'ember-cp-validations';

let Validations = buildValidations({
  options: [
    validator('collection', true),
    validator('length', {
      dependentKeys: ['options.[]'],
      min() {
        if (this.get('isFindADate') && this.get('isDateTime')) {
          return 1;
        } else {
          return 2;
        }
      }
      // message: Ember.I18n.t('create.options.error.notEnoughOptions')
    }),
    validator('unique-collection', {
      dependentKeys: ['options.[]', 'options.@each.title'],
      property: 'title'
    }),
    validator('valid-collection', {
      dependentKeys: ['options.[]', 'options.@each.title']
    })
  ]
});

export default Ember.Component.extend(Validations, {
  actions: {
    submit() {
      if (this.get('validations.isValid')) {
        this.sendAction('nextPage');
      } else {
        this.set('shouldShowErrors', true);
      }
    }
  },
  shouldShowErrors: false
});