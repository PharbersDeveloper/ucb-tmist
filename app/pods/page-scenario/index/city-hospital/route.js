import Route from '@ember/routing/route';
import EmberObject from '@ember/object';
import { hash, all } from 'rsvp';
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
			{ destConfigRegions, salesConfigs } = pageScenarioModel;

		let regionConfig = destConfigRegions.firstObject.get('regionConfig'),
			cities = A([]),
			citiesName = A([]);

		return regionConfig.then(data => {
			return data.get('region');
		}).then(data => {
			return data.get('cities');
		}).then(data => {
			cities = data;
			citiesName = data.map(ele => ele.get('name'));

			return all(data.map(ele => ele.get('hospitalConfigs')));
		}).then(data => {

			let hospitalNumbers = data.map((ele, index) => {
					return {
						cityName: citiesName[index],
						thirdLevel: ele.filterBy('hospital.hospitalLevel', '三级'),
						secondLevel: ele.filterBy('hospital.hospitalLevel', '二级'),
						firstLevel: ele.filterBy('hospital.hospitalLevel', '一级')
					};
				}),
				initTotal = EmberObject.create({ thirdLevel: 0, secondLevel: 0, firstLevel: 0 }),
				total = hospitalNumbers.reduce((acc, current) => {
					acc.thirdLevel += current.thirdLevel.length;
					acc.secondLevel += current.secondLevel.length;
					acc.firstLevel += current.firstLevel.length;

					return acc;
				}, initTotal);

			return hash({
				total,
				hospitalNumbers,
				city: cities.firstObject,
				destConfigRegion: destConfigRegions.firstObject,
				salesConfigs
			});
		});
	}
});
