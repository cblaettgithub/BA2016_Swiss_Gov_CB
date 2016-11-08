/**
 * Created by chris on 22.10.2016.
 */

module.export = SettingData = function(name)
{this.name=name;};
SettingData.prototype.setData=
function setData(id){
    this.id = id;
}
SettingData.prototype.setParam=function(newName, newMatrix){
    this.name=newName;
    this.matrix=newMatrix
}
SettingData.prototype.getName=function(){
     return this.name;
}
SettingData.prototype.getMatrix=function(){
    return this.matrix;
}