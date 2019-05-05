import Controller from '@ember/controller';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
const { keys } = Object;

export default Controller.extend({
	cookies: service(),
	actions: {
		/**
		 * 账号设置
		 */
		setting() {

		},
		/**
		 * 退出账号
		 */
		logout() {
			let cookies = this.get('cookies').read(),
				totalCookies = A([]);

			totalCookies = keys(cookies).reduce((acc, key) => {
				let value = cookies[key];

				acc.push({ name: key, value });

				return acc;
			}, []);

			new RSVP.Promise((resolve) => {
				totalCookies.forEach(ele => {
					this.get('cookies').clear(ele.name, { domain: 'pharbers.com' });
				});
				localStorage.clear();
				return resolve(true);
			}).then(() => {
				window.location.reload();
			});
		},
		endMission() {
			this.transitionToRoute('index');
		},
		exitMission() {

		}
	}
});
