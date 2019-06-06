import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | page-result/region', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:page-result/region');
    assert.ok(route);
  });
});
