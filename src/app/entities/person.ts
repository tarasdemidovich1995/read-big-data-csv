export class Person {
  public index: number;
  public userId: string;
  public firstName: string;
  public lastName: string;
  public sex: string;
  public email: string;
  public phone: string;
  public birthDate: Date;
  public jobTitle: string;

  static fromCsv(str: string) {
      const instance = new Person();

      const [index, userId, firstName, lastName, sex, email, phone, birthDate, jobTitle] = str.split(',');


      instance.index = parseInt(index, 10);
      instance.userId = userId;
      instance.firstName = firstName;
      instance.lastName = lastName;
      instance.sex = sex;
      instance.email = email;
      instance.phone = phone;
      instance.birthDate = new Date(birthDate);
      instance.jobTitle = jobTitle;

      return instance;
  }
}
