import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash, all } from 'rsvp';
import { A } from '@ember/array';

export default Route.extend({
	cookies: service(),
	/**
	 * 判断是否有 businessinput
	 * @param  {model} paper
	 * @param  {model} destConfigs
	 * @param  {model} selfGoodsConfigs
	 */
	isHaveBusinessInput(paper, destConfigs, selfGoodsConfigs) {
		let state = paper.get('state'),
			reDeploy = Number(localStorage.getItem('reDeploy')) === 1;

		if (state === 1 && !reDeploy) {
			return this.get('store').peekAll('businessinput');
		}
		return this.generateBusinessInputs(destConfigs, selfGoodsConfigs);
	},
	/**
	 * 生成 businessinputs
	 * @param  {model} destConfigs
	 * @param  {model} selfGoodsConfigs
	 */
	generateBusinessInputs(destConfigs, selfGoodsConfigs) {
		let promiseArray = A([]),
			store = this.get('store');

		promiseArray = destConfigs.map(ele => {
			let goodsConfigInputs = selfGoodsConfigs.map(item => {
				return store.createRecord('goodsConfigInput', {
					goodsConfig: item,
					salesTarget: '',	// 销售目标设定
					budget: ''
				});
			});

			return store.createRecord('businessinput', {
				destConfig: ele,
				destConfigId: ele.id,
				representativeId: '',
				resourceConfigId: '',
				resourceConfig: null,
				salesTarget: '',
				budget: '',
				goodsConfigs: selfGoodsConfigs,
				goodsConfigInputs,
				meetingPlaces: '',
				visitTime: ''
			});
		});
		return promiseArray;
	},
	model(params) {

		const store = this.get('store'),
			cookies = this.get('cookies'),
			noticeModel = this.modelFor('page-notice'),
			scenario = noticeModel.scenario,
			scenarioId = scenario.get('id'),
			proposalId = params['proposal_id'],
			paper = noticeModel.detailPaper;

		let proposal = noticeModel.detailProposal,
			destConfigs = null,
			goodsConfigs = null,
			resourceConfRep = null,
			resourceConfManager = null,
			managerTotalTime = 0,
			managerTotalKpi = 0,
			businessInputs = null,
			salesReports = A([]),
			lastSeasonHospitalSalesReports = A([]);

		return store.findRecord('proposal', proposalId)
			.then(data => {
				proposal = data;
				// 获取 resourceConfig -> 代表
				return store.query('resourceConfig',
					{
						'scenario-id': scenarioId,
						'resource-type': 1
					});
			})
			.then(data => {
				resourceConfRep = data;
				// 获取 resourceConfig -> 经理
				return store.queryRecord('resourceConfig',
					{
						'scenario-id': scenarioId,
						'resource-type': 0
					});
			})
			// 获取经理分配总时间/总点数
			.then(data => {
				resourceConfManager = data;
				// 获取 goodsConfigs 为判断 businessinputs 做准备
				return store.query('goodsConfig',
					{ 'scenario-id': scenarioId });
			}).then(data => {
				goodsConfigs = data;
				return proposal.get('salesReports');
			}).then(data => {
				salesReports = data.sortBy('time');

				let salesReport = salesReports.get('lastObject');

				return salesReport.get('hospitalSalesReports');
			}).then(data => {

				lastSeasonHospitalSalesReports = data.sortBy('potential').reverse();

				let promiseArray = lastSeasonHospitalSalesReports.map(ele => {
					return ele.get('destConfig');
				});

				return all(promiseArray);
				// 判断 管理决策是否存在
			}).then(data => {

				destConfigs = data;

				let selfGoodsConfigs = goodsConfigs.filter(ele => ele.get('productConfig.productType') === 0);

				businessInputs = this.isHaveBusinessInput(paper, destConfigs, selfGoodsConfigs);

				return hash({
					proposal,
					businessInputs,
					paper,
					scenario,
					paperState: paper.get('state'),
					resourceConfRep,
					resourceConfManager,
					managerTotalTime,
					managerTotalKpi,
					goodsConfigs,
					destConfigs,
					salesReports,
					lastSeasonHospitalSalesReports,
					resourceConfig: store.query('resourceConfig',
						{ 'scenario-id': scenarioId }),
					salesConfigs: store.query('salesConfig',
						{
							'scenario-id': scenarioId,
							'proposal-id': proposalId,
							'account-id': cookies.read('account_id')
						})
				});
			});
	},
	afterModel() {
		let applicationController = this.controllerFor('application');

		applicationController.set('testProgress', 2);
	},
	setupController(controller, model) {
		this._super(...arguments);
		controller.set('businessInputs', model.businessInputs);
	}
});
