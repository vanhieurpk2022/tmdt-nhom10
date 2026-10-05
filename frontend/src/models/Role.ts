export class Role {
  id?: number;
  name: string = "";

  constructor(init?: Partial<Role>) {
    Object.assign(this, init);
  }
}
