import DS from 'ember-data';
import { computed } from '@ember/object';
import { camelize } from '@ember/string';
import { pluralize } from 'ember-inflector';
import { inject as service } from '@ember/service';

export default DS.JSONAPIAdapter.extend({
	namespace: 'v0',
	/**
	 * 线上
	 */
	// host: 'http://ucb.pharbers.com',
	// serviceHost: 'http://oauth.pharbers.com',
	/**
	 * 本地
	 */
	host: 'http://ucb.pharbers.com:8082',
	serviceHost: 'http://192.168.100.174:9096',
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
