import DS from 'ember-data';
import { computed } from '@ember/object';
import { camelize } from '@ember/string';
import { pluralize } from 'ember-inflector';
import { inject as service } from '@ember/service';
import ENV from 'ucb-tmist/config/environment';

export default DS.JSONAPIAdapter.extend({
	namespace: 'v0',
	host: ENV.redirectUri,
	serviceHost: ENV.host,
	scope: `APP/UCB`,
	cookies: service(),
	pathForType(type) {
		let newType = pluralize(camelize(type));

		return newType;
	},
	headers: computed(function () {
		let cookies = this.get('cookies');

		return {
			'dataType': 'json',
			'contentType': 'application/json',
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${cookies.read('access_token')}`
		};
	})
});
