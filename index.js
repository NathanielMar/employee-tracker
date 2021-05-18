const inquirer = require("inquirer");
const Employee = require("./models/Employee");
const Role = require("./models/Role");
const Department = require("./models/Department");
const cTable = require("console.table");
const { raw } = require("express");

const viewEmployees = async () => {
  let employees = await Employee.findAll();
  employeeList = employees.map((d) => d.dataValues);

  for (i = 0; i < employeeList.length; i++) {
    let roleName = await Role.findAll({
      where: {
        id: employeeList[i].role_id,
      },
      raw: true,
    });
    let managerName = await Employee.findAll({
      where: {
        id: employeeList[i].manager_id,
      },
      raw: true,
    });
    let departmentName = await Department.findAll({
      where: {
        id: roleName[0].department_id,
      },
    });
    if (managerName[0]) {
      employeeList[i].manager_id = managerName[0].first_name;
    }
    employeeList[i].role_id = roleName[0].title;
    employeeList[i].salary = roleName[0].salary;
    employeeList[i].department = departmentName[0].name;
  }
  console.table(employeeList);
};

const start = async () => {
  await viewEmployees();
  inquirer
    .prompt([
      {
        type: "list",
        name: "mainQuestion",
        message: "What would you like to do?",
        choices: [
          "View All Employees",
          "View All Departments and Employees",
          "View All Roles",
          "Add Employee",
          "Add Role",
          "Add Department",
          "Remove Employee",
          "Remove Department",
          "Remove Role",
          "Update Employee Role",
          "Update Employee Manager",
        ],
      },
    ])
    .then((answer) => {
      let chosen = answer.mainQuestion;

      switch (chosen) {
        case "View All Employees":
          allEmployee();
          break;

        case "View All Departments and Their Employees":
          allDepartment();
          break;

        case "Add Employee":
          addEmployee();
          break;

        case "Add Department":
          addDepartment();
          break;

        case "Add Role":
          addRole();
          break;

        case "Remove Employee":
          removeEmployee();
          break;

        case "Remove Department":
          removeDepartment();
          break;

        case "Remove Role":
          removeRole();
          break;

        case "Update Employee Role":
          updateRole();
          break;

        case "Update Employee Manager":
          updateManager();
          break;

        case "View All Roles":
          viewRoles();
          break;
      }
    });
};

const allEmployee = async () => {
  let employeeList = [];
  const employee = await Employee.findAll({
    raw: true,
  });
  for (i = 0; i < employee.length; i++) {
    employeeList.push(employee[i].first_name);
  }

  inquirer
    .prompt([
      {
        type: "list",
        name: "mainQuestion",
        message: "Here is a list of the employees, click one to return.",
        choices: employeeList,
      },
    ])
    .then((answer) => {
      start();
    });
};

const allDepartment = async () => {
  let departmentList = [];
  const department = await Department.findAll({
    raw: true,
  });

  for (i = 0; i < department.length; i++) {
    departmentList.push(department[i].name);
  }
  departmentList.push("Return To Main Menu");
  inquirer
    .prompt([
      {
        type: "list",
        name: "mainQuestion",
        message:
          "Select a department to view all the employees under that department.",
        choices: departmentList,
      },
    ])
    .then(async (answer) => {
      if (answer.mainQuestion === "Return To Main Menu") {
        start();
      } else {
        departmentChoice = answer.mainQuestion;

        let employeeArray = [];
        const departmentChosen = await Department.findAll({
          where: {
            name: departmentChoice,
          },
          raw: true,
        });
        const rolesChosen = await Role.findAll({
          where: {
            department_id: departmentChosen[0].id,
          },
          raw: true,
        });
        for (i = 0; i < rolesChosen.length; i++) {
          const employeesChosen = await Employee.findAll({
            where: {
              role_id: rolesChosen[i].id,
            },
            raw: true,
          });
          for (i = 0; i < employeesChosen.length; i++) {
            employeeArray.push(employeesChosen[i].first_name);
          }
        }
        employeeArray.push("Return");
        inquirer
          .prompt([
            {
              type: "list",
              name: "employeeArray",
              message: "Select an employee to return",
              choices: employeeArray,
            },
          ])
          .then((answer) => {
            allDepartment();
          });
      }
    });
};

const viewRoles = async () => {
  let role = [];

  const roleList = await Role.findAll({
    raw: true,
  });

  for (i = 0; i < roleList.length; i++) {
    role.push(roleList[i].title);
  }

  inquirer
    .prompt([
      {
        type: "list",
        message: "Here are the roles, click one to return",
        name: "allRoles",
        choices: role,
      },
    ])
    .then((answer) => {
      start();
    });
};

const addRole = async () => {
  let departments = [];

  const departemntList = await Department.findAll({
    raw: true,
  });

  for (i = 0; i < departemntList.length; i++) {
    departments.push(departemntList[i].name);
  }

  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the name of the role you want to add?",
        name: "roleName",
      },
      {
        type: "input",
        message: "What's the salary of the role you wish to add?",
        name: "roleSalary",
      },
      {
        type: "list",
        message: "What is the department of the role you wish to add?",
        name: "roleDepartment",
        choices: departments,
      },
    ])
    .then(async (answer) => {
      departmentName = answer.roleDepartment;

      const departments = await Department.findAll({
        where: {
          name: departmentName,
        },
        raw: true,
      });

      await Role.create({
        title: answer.roleName,
        salary: answer.roleSalary,
        department_id: departments[0].id,
      });
      console.log("Role has been added");
      start();
    });
};

const removeRole = async () => {
  let roleList = [];

  const role = await Role.findAll({
    raw: true,
  });

  for (i = 0; i < role.length; i++) {
    roleList.push(role[i].title);
  }
  roleList.push("Return To Main Menu");
  inquirer
    .prompt([
      {
        type: "list",
        message: "What'ss the name of the role you wish to remove?",
        name: "roleChoice",
        choices: roleList,
      },
    ])
    .then(async (answer) => {
      if (answer.roleChoice === "Return To Main Menu") {
        start();
      } else {
        let roleName = answer.roleChoice;
        await Role.destroy({
          where: {
            title: roleName,
          },
        });
        console.log("Role has been Deleted");
        start();
      }
    });
};

const addDepartment = async () => {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What's the name of the department you wish to add?",
        name: "newDepartment",
      },
    ])
    .then(async (answer) => {
      let departmentName = answer.newDepartment;
      await Department.create({
        name: departmentName,
      });
      console.log("Department has been added");
      start();
    });
};

const removeDepartment = async () => {
  let departmentList = [];

  const department = await Department.findAll({
    raw: true,
  });

  for (i = 0; i < department.length; i++) {
    departmentList.push(department[i].name);
  }
  departmentList.push("Return To Main Menu");
  inquirer
    .prompt([
      {
        type: "list",
        message: "What is the name of the department you wish to remove?",
        name: "department",
        choices: departmentList,
      },
    ])
    .then(async (answer) => {
      let departmentName = answer.department;
      if (departmentName === "Return To Main Menu") {
        start();
      } else {
        const chosenDepartment = await Department.findAll({
          where: {
            name: departmentName,
          },
          raw: true,
        });
        const rolesInDepartment = await Role.findAll({
          where: {
            department_id: chosenDepartment[0].id,
          },
          raw: true,
        });
        console.log(rolesInDepartment);
        if (rolesInDepartment.length === 0) {
          await Department.destroy({
            where: {
              name: departmentName,
            },
          });
          console.log("Department has been Removed");
          start();
        } else {
          console.log("[YOU MUST REMOVE ANY ROLES IN THIS DEPARTMENT FIRST]");
          removeDepartment();
        }
      }
    });
};

const addEmployee = async () => {
  let managerList = [];
  let roleList = [];

  const manager = await Employee.findAll({
    where: {
      manager_id: null,
    },
    raw: true,
  });
  for (i = 0; i < manager.length; i++) {
    managerList.push(manager[i].first_name);
  }
  managerList.push("They are a manager");

  const role = await Role.findAll({
    raw: true,
  });
  for (i = 0; i < role.length; i++) {
    roleList.push(role[i].title);
  }
  inquirer
    .prompt([
      {
        type: "input",
        name: "employeeName",
        message: "What is the employee's first name?",
      },
      {
        type: "input",
        name: "employeeLast",
        message: "What is the employee's last name?",
      },
      {
        type: "list",
        name: "employeeRole",
        message: "What is the employee's role?",
        choices: roleList,
      },
      {
        type: "list",
        name: "employeeManager",
        message: "Who is the employee's manager?",
        choices: managerList,
      },
    ])
    .then(async (answer) => {
      firstName = answer.employeeName;
      lastName = answer.employeeLast;
      employeRole = answer.employeeRole;
      managerName = answer.employeeManager;

      if (managerName === "They are a manager") {
        let roleID = await Role.findAll({
          where: {
            title: role,
          },
          raw: true,
        });
        await Employee.create({
          first_name: firstName,
          last_name: lastName,
          role_id: roleID[0].id,
          manager_id: null,
        });
        start();
      } else {
        let managerID = await Employee.findAll({
          where: {
            first_name: managerName,
            manager_id: null,
          },
          raw: true,
        });
        let roleID = await Role.findAll({
          where: {
            title: employeRole,
          },
          raw: true,
        });
        await Employee.create({
          first_name: firstName,
          last_name: lastName,
          role_id: roleID[0].id,
          manager_id: managerID[0].id,
        });
        start();
      }
    });
};

const removeEmployee = async () => {
  let employeeList = [];

  const employee = await Employee.findAll({
    raw: true,
  });

  for (i = 0; i < employee.length; i++) {
    employeeList.push(employee[i].first_name);
  }
  employeeList.push("Return To Main Menu");
  inquirer
    .prompt([
      {
        type: "list",
        name: "removeQuestion",
        message: "What employee do you wish to remove?",
        choices: employeeList,
      },
    ])
    .then(async (answer) => {
      if (answer.removeQuestion === "Return To Main Menu") {
        start();
      } else {
        const employeeToDelete = await Employee.findAll({
          where: {
            first_name: answer.removeQuestion,
          },
          raw: true,
        });
        const suboordinates = await Employee.findAll({
          where: {
            manager_id: employeeToDelete[0].id,
          },
          raw: true,
        });
        if (suboordinates.length !== 0) {
          console.log("[YOU NEED TO REMOVE EMPLOYEES UNDER THIS MANAGER FIRST]");
          removeEmployee();
        } else {
          await Employee.destroy({
            where: {
              first_name: answer.removeQuestion,
            },
          });
          console.log("Employee has been removed from the list.");
          start();
        }
      }
    });
};

const updateRole = async () => {
  let employeeList = [];
  let roleList = [];

  const employee = await Employee.findAll({
    raw: true,
  });
  for (i = 0; i < employee.length; i++) {
    employeeList.push(employee[i].first_name);
  }
  const role = await Role.findAll({
    raw: true,
  });
  for (i = 0; i < role.length; i++) {
    roleList.push(role[i].title);
  }

  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeChoice",
        message: "What employee role do you wish to update?",
        choices: employeeList,
      },
      {
        type: "list",
        name: "roleUpdate",
        message: "What's the employees role?",
        choices: roleList,
      },
    ])
    .then(async (answer) => {
      let selected = await Employee.findAll({
        where: {
          first_name: answer.employeeChoice,
        },
        raw: true,
      });
      let theRole = await Role.findAll({
        where: {
          title: answer.roleUpdate,
        },
        raw: true,
      });
      Employee.update(
        { role_id: theRole[0].id },
        {
          where: {
            first_name: selected[0].first_name,
          },
        }
      );

      console.log("Employees role has updated.");
      start();
    });
};

const updateManager = async () => {
  let employeeList = [];

  const employee = await Employee.findAll({
    raw: true,
  });

  for (i = 0; i < employee.length; i++) {
    employeeList.push(employee[i].first_name);
  }
  let managerList = [];

  const manager = await Employee.findAll({
    where: {
      manager_id: null,
    },
    raw: true,
  });

  for (i = 0; i < manager.length; i++) {
    managerList.push(manager[i].first_name);
  }
  managerList.push("Return");
  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeChoice",
        message: "What employees manager do you wish to update?",
        choices: employeeList,
      },
      {
        type: "list",
        name: "managerUpdate",
        message: "What's the managers name?",
        choices: managerList,
      },
    ])
    .then(async (answer) => {
      if (answer.managerUpdate === "Return") {
        start();
      }
      let selected = await Employee.findAll({
        where: {
          first_name: answer.employeeChoice,
        },
        raw: true,
      });
      console.log(selected[0]);

      let theManager = await Employee.findAll({
        where: {
          first_name: answer.managerUpdate,
        },
        raw: true,
      });

      console.log(theManager[0]);

      Employee.update(
        { manager_id: theManager[0].id },
        {
          where: {
            first_name: selected[0].first_name,
          },
        }
      );

      console.log("Employees role has updated.");
      start();
    });
};

module.exports = { start };