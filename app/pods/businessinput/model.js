import DS from 'ember-data';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';

export default DS.Model.extend({
	destConfigId: DS.attr('string'),	// 待删除
	resourceConfigId: DS.attr('string'),
	salesTarget: DS.attr('number'),	// 销售目标设定
	budget: DS.attr('number'),	// 预算费用
	// meetingPlaces: DS.attr('number'),	//	会议名额 ucb中删除
	// visitTime: DS.attr('number'),	// ucb中删除
	isFinish: computed('salesTarget', 'budget', 'resourceConfigId', function () {
		let { salesTarget, budget, resourceConfigId } =
			this.getProperties('salesTarget', 'budget', 'resourceConfigId'),
			tmpArray = A([salesTarget, budget, resourceConfigId]);

		return tmpArray.every(ele => {
			return !isEmpty(ele);
		});
	}),
	destConfig: DS.belongsTo(),
	resourceConfig: DS.belongsTo(),
	goodsConfig: DS.belongsTo()
});