import Route from '@ember/routing/route';
import { A } from '@ember/array';
import { hash, all } from 'rsvp';
import { isEmpty } from '@ember/utils';

export default Route.extend({
	model(params) {
		const indexModel = this.modelFor('index'),
			{ detailProposal, scenario, destConfigRegions, destConfigHospitals, resourceConfigRepresentatives, goodsConfigs } = indexModel,
			selfGoodsConfigs = goodsConfigs.filterBy('productConfig.productType', 0);

		let navs = A([
				{ name: '产品销售报告', route: 'page-result.index' },
				{ name: '地区销售报告', route: 'page-result.region' },
				{ name: '代表销售报告', route: 'page-result.representative' },
				{ name: '医院销售报告', route: 'page-result.hospital' }
			]),
			barLineKeys = A([
				{ name: '销售额', key: 'sales' },
				{ name: '指标', key: 'salesQuota' },
				{ name: '指标达成率', key: 'quotaAchievement' }
			]),
			increaseSalesReports = A([]),
			tmpHead = A([]),
			proposal = null,
			curPaper = null,
			latestSeasonName = null,
			tmpHeadQ = A([]);

		return detailProposal.get('proposal')
			.then(data => {
				proposal = data;

				return this.store.findRecord('paper', params['paper_id'], { reload: true });
			}).then(data => {
				curPaper = data;
				return data.get('salesReports');
			})
			.then(data => {
				increaseSalesReports = data.sortBy('time');
				return all(increaseSalesReports.map(ele => {
					return ele.get('scenario');
				}));
			}).then(data => {
				latestSeasonName = data.lastObject.get('name');
				tmpHead = data.map(ele => {
					let name = ele.get('name');

					return name;
					// return name.slice(0, 4) + name.slice(-4);
				});
				tmpHeadQ = tmpHead.map(ele => ele);

				return hash({
					latestSeasonName,
					curPaper,
					tmpHead,
					tmpHeadQ,
					barLineKeys,
					increaseSalesReports,
					scenario,
					detailProposal,
					proposal,
					destConfigRegions,
					resourceConfigRepresentatives,
					destConfigHospitals,
					goodsConfigs,
					selfGoodsConfigs,
					navs
				});
			});
	},
	setupController(controller) {
		this._super(...arguments);
		if (localStorage.getItem('isHistory') === 'true') {
			controller.set('isHistory', true);
		} else {
			controller.set('isHistory', false);
		}
	},
	activate() {
		this._super(...arguments);
		let controller = this.controllerFor('page-report');

		if (localStorage.getItem('isHistory') === 'true') {
			controller.set('isHistory', true);
		} else {
			controller.set('isHistory', false);
		}
	},
	afterModel() {
		let applicationController = this.controllerFor('application');

		applicationController.set('testProgress', 3);
	},
	seasonQ(seasonText) {
		let season = isEmpty(seasonText) ? '' : seasonText;

		if (season === '') {
			return season;
		}
		season = season.replace('第一季度', 'Q1');
		season = season.replace('第二季度', 'Q2');
		season = season.replace('第三季度', 'Q3');
		season = season.replace('第四季度', 'Q4');

		return season;
	}
});
