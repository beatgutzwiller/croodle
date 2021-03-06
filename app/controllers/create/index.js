import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { alias } from '@ember/object/computed';
import Controller from '@ember/controller';
import {
  validator, buildValidations
}
from 'ember-cp-validations';

const Validations = buildValidations({
  pollType: [
    validator('presence', {
      presence: true,
      dependentKeys: ['model.intl.locale']
    }),
    validator('inclusion', {
      in: ['FindADate', 'MakeAPoll'],
      dependentKeys: ['model.intl.locale']
    })
  ]
});

export default class CreateIndex extends Controller.extend(Validations) {
  @service
  intl;

  @alias('model.pollType')
  pollType;

  @action
  submit() {
    if (this.get('validations.isValid')) {
      this.transitionToRoute('create.meta');
    }
  }

  init() {
    super.init(...arguments);

    this.intl.locale;
  }
}
