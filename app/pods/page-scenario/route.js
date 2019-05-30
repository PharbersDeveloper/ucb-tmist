import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';
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
			reDeploy = Number(localStorage.getItem('reDeploy')) === 1,
			exitInEmberData = this.get('store').peekAll('businessinput');

		if (state === 1 && !reDeploy || exitInEmberData.get('length') > 0) {
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
			let goodsInputs = selfGoodsConfigs.map(item => {
				return store.createRecord('goodsinput', {
					goodsConfig: item,
					// salesTarget: '',	// 销售目标设定
					// budget: ''	//预算设定
					// TODO 测试，用后删除
					salesTarget: 75000,	// 销售目标设定
					budget: 42500	//预算设定
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
				goodsinputs: goodsInputs,
				meetingPlaces: '',
				visitTime: ''
			});
		});
		return promiseArray;
	},
	model(params) {
		const store = this.get('store'),
			cookies = this.get('cookies'),
			pageIndexModel = this.modelFor('index'),
			scenario = pageIndexModel.scenario,
			scenarioId = scenario.get('id'),
			proposalId = params['proposal_id'],
			paper = pageIndexModel.detailPaper;

		let { detailProposal, destConfigs, goodsConfigs } = pageIndexModel,
			proposal = null,
			businessInputs = null,
			salesReports = A([]),
			lastSeasonHospitalSalesReports = A([]);

		return detailProposal.get('proposal')
			.then(data => {
				proposal = data;
				return data.get('salesReports');
			}).then(data => {
				salesReports = data.sortBy('time');

				let salesReport = salesReports.get('lastObject');

				return salesReport.get('hospitalSalesReports');
			}).then(data => {
				lastSeasonHospitalSalesReports = data.sortBy('potential').reverse();

				return destConfigs.map(ele => ele);
			}).then(data => {
				let selfGoodsConfigs = goodsConfigs.filter(ele => ele.get('productConfig.productType') === 0);

				businessInputs = this.isHaveBusinessInput(paper, data, selfGoodsConfigs);

				return hash({
					proposal,
					businessInputs,
					paper,
					scenario,
					paperState: paper.get('state'),
					resourceConfRep: pageIndexModel.resourceConfigRepresentatives,
					resourceConfManager: pageIndexModel.resourceConfigManager,
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
	afterModel(model) {
		let applicationController = this.controllerFor('application');

		applicationController.set('testProgress', 2);
		applicationController.setProperties({
			proposal: model.proposal,
			scenario: model.scenario,
			paper: model.paper
		});
		// applicationController.set('proposal', model.proposal);

	},
	setupController(controller, model) {
		this._super(...arguments);
		controller.set('businessInputs', model.businessInputs);
	}
});
