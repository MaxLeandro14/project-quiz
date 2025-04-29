<template>
    <header>
      <nav class="nav-bar">
        <div class="container">
          <div class="nav-bar-desktop">
            <div class="logo">
              <img src="/buser-horizontal-rosa.svg" alt="Logo" />
            </div>
            <div class="nav-bar-desktop__links">
              <Avatar icon="pi pi-user" class="mr-2 nav-bar-desktop__links__avatar" shape="circle" />
            </div>
          </div>
        </div>
      </nav>
    </header>
  </template>
  
  <style lang="scss" scoped>
.nav-bar{
  background-color: #fafafa;
  height: 60px;

  .nav-bar-desktop {
    align-items: center;
    display: flex;
    flex-grow: 1;
    height: 100%;
    justify-content: space-between;
    max-width: 100%;
  }
  .nav-bar-desktop__links__avatar {
    background-color: #ff0075 !important;
    color: #ffffff !important;
    width: 2.25rem !important;
    height: 2.25rem !important;
    cursor: pointer;
  }
  .nav-bar-desktop__links__avatar:hover {
    border: 1px solid #c62727;
  }
}
</style>
  