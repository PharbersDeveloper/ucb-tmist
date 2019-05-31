import DS from 'ember-data';

export default DS.Model.extend({
	level: DS.attr('string'),
	localPatientRatio: DS.attr('number'),	// 本地患者占比
	name: DS.attr('string'),
	nonlocalPatientRatio: DS.attr('number'),	// 外地患者占比
	type: DS.attr('string'),
	hospitalConfigs: DS.hasMany(),
	images: DS.hasMany()
});
