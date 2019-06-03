import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | page-scenario/index/performance', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:page-scenario/index/performance');
    assert.ok(controller);
  });
});
