import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { A } from '@ember/array';

export default Route.extend({
	model() {
		return hash({
			citiesHospital: A([
				{ name: 'A市', third: 45, second: 61290, first: 47678 },
				{ name: 'B市', third: 45, second: 61290, first: 47678 },
				{ name: 'C市', third: 45, second: 61290, first: 47678 }
			])
		});
	},
	setupController(controller) {
		this._super(...arguments);
		controller.set('tmpCityInfo', {
			name: '城市A',
			destConfigs: A([
				{
					hospitalConfig: {
						hospital: {
							name: '安贞医院',
							describe: 'describe',
							code: 123,
							hospitalCategory: '综合',
							hospitalLevel: '三级',
							position: '1312 Soliv Grove',
							regtime: '1996/01',
							images: A([
								{ img: 'https://i.loli.net/2019/04/15/5cb4650ddde95.jpg' }
							])
						}
					}
				},
				{
					hospitalConfig: {
						hospital: {
							name: '331医院',
							describe: 'describe',
							code: 123,
							hospitalCategory: '耳鼻喉',
							hospitalLevel: '三级',
							position: '1312 Soliv Grove',
							regtime: '1996/01',
							images: A([
								{ img: 'https://i.loli.net/2019/04/15/5cb4650ddde95.jpg' }
							])
						}
					}
				}
			])
		});
	}
});
