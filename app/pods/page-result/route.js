import Route from '@ember/routing/route';
import { A } from '@ember/array';
import { hash, all } from 'rsvp';
import { isEmpty } from '@ember/utils';

export default Route.extend({

	model() {
		const indexModel = this.modelFor('index'),
			{ detailProposal, detailPaper, scenario, destConfigRegions, destConfigHospitals, resourceConfigRepresentatives, goodsConfigs } = indexModel,
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
			tmpHeadQ = A([]);

		return detailPaper.get('salesReports')
			.then(data => {
				increaseSalesReports = data.sortBy('time');
				return all(increaseSalesReports.map(ele => {
					return ele.get('scenario');
				}));
			}).then(data => {

				tmpHead = data.map(ele => {
					let name = ele.get('name');

					return name.slice(0, 4) + name.slice(-4);
				});
				tmpHeadQ = tmpHead.map(ele => {
					return this.seasonQ(ele);
				});

				return hash({
					tmpHead,
					tmpHeadQ,
					barLineKeys,
					increaseSalesReports,
					scenario,
					detailProposal,
					destConfigRegions,
					resourceConfigRepresentatives,
					destConfigHospitals,
					goodsConfigs,
					selfGoodsConfigs,
					navs
				});
			});
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
