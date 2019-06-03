import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | page-scenario/index/city-hospital', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:page-scenario/index/city-hospital');
    assert.ok(controller);
  });
});
