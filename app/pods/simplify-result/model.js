import DS from 'ember-data';

export default DS.Model.extend({
	totalQuotaAchievement: DS.attr('number'),
	levelConfig: DS.belongsTo(),
	scenarioResults: DS.hasMany()
});
