import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | page-scenario/business', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:page-scenario/business');
    assert.ok(route);
  });
});
