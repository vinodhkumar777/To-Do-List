
getDate();
function getDate(){
  let today=new Date();
  const days=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
 // console.log(today.getMonth());//getmonth getday returns the index of day or month from 0 th index
  //for formatting date as our wish
  let options={
      weekday: "long",
      day: "numeric",
      month: "long"
  }
  //converting the date to our required format
  let day=today.toLocaleDateString("en-US",options);
  module.exports=day;
}