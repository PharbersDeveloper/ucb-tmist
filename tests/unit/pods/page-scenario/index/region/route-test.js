import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | page-scenario/index/region', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:page-scenario/index/region');
    assert.ok(route);
  });
});
