import Route from '@ember/routing/route';
import rsvp from 'rsvp';
import { hash } from 'rsvp';
import { A } from '@ember/array';

export default Route.extend({
	generatePromiseArray(reports, key) {
		let promiseArray = A([]);

		promiseArray = reports.map(ele => {
			return ele.get(key);
		});
		return promiseArray;
	},
	model() {
		const pageScenarioModel = this.modelFor('page-scenario'),
			{destConfigRegions} = pageScenarioModel,
			tmpcity = destConfigRegions.firstObject.get('regionConfig').then(data => {
				return data.get('region');
			}).then(data => {
				return data.get('cities');
			}).then(data => {
				let num = data.firstObject.get('hospitalConfigs').length;

				return {
					cityData: [data.firstObject],
					hospNum: num
				};
			});

		return hash({
			destConfigRegion: destConfigRegions.firstObject,
			tmpcity: tmpcity,
			citiesHospital: A([
				{ name: 'A市', third: 45, second: 61290, first: 47678 },
				{ name: 'B市', third: 45, second: 61290, first: 47678 },
				{ name: 'C市', third: 45, second: 61290, first: 47678 }
			])
		});
	},
	setupController(controller, model) {
		this._super(...arguments);
		controller.set('city', model.tmpcity);
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
